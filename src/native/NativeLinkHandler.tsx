import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Room } from 'matrix-js-sdk';
import { useMatrixClient } from '../app/hooks/useMatrixClient';
import { useRoomNavigate } from '../app/hooks/useRoomNavigate';
import {
  parseMatrixToRoom,
  parseMatrixToRoomEvent,
  parseMatrixToUser,
} from '../app/plugins/matrix-to';
import { getDirectCreatePath, getHomeRoomPath, withSearchParam } from '../app/pages/pathUtils';
import { _RoomSearchParams, DirectCreateSearchParams } from '../app/pages/paths';
import { isRoomAlias, isRoomId } from '../app/utils/matrix';
import { onLink } from './deepLinks';

/**
 * Opens matrix.to and matrix: links that the OS hands to the app. Mounted
 * inside the logged-in routes; links that arrive earlier wait until then.
 */
export function NativeLinkHandler() {
  const mx = useMatrixClient();
  const navigate = useNavigate();
  const { navigateRoom, navigateSpace } = useRoomNavigate();

  useEffect(
    () =>
      onLink((href) => {
        const userId = parseMatrixToUser(href);
        if (userId) {
          navigate(withSearchParam<DirectCreateSearchParams>(getDirectCreatePath(), { userId }));
          return;
        }

        const roomEvent = parseMatrixToRoomEvent(href);
        const target = roomEvent ?? parseMatrixToRoom(href);
        if (!target) return;
        const { roomIdOrAlias, viaServers } = target;
        const eventId = roomEvent?.eventId;

        let roomId: string | undefined;
        if (isRoomId(roomIdOrAlias)) roomId = roomIdOrAlias;
        else if (isRoomAlias(roomIdOrAlias)) {
          roomId = mx
            .getRooms()
            .find(
              (room: Room) =>
                room.getCanonicalAlias() === roomIdOrAlias ||
                room.getAltAliases().includes(roomIdOrAlias)
            )?.roomId;
        }

        const room: Room | null = roomId ? mx.getRoom(roomId) : null;
        if (room && room.getMyMembership() === 'join') {
          if (room.isSpaceRoom()) navigateSpace(room.roomId);
          else navigateRoom(room.roomId, eventId);
          return;
        }

        // Not joined: the room route shows the join prompt.
        const path = getHomeRoomPath(roomIdOrAlias, eventId);
        navigate(
          viaServers
            ? withSearchParam<_RoomSearchParams>(path, { viaServers: viaServers.join(',') })
            : path
        );
      }),
    [mx, navigate, navigateRoom, navigateSpace]
  );

  return null;
}

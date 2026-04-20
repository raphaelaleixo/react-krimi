import { ref, get } from 'firebase/database';
import { deserializeRoom, type RoomStatus } from 'react-gameroom';
import { database } from '../firebase';

/**
 * One-shot read of a room's status. Returns `null` when the room does not exist,
 * otherwise `'lobby'` or `'started'`. Used by the /join resume page to route the
 * user to the right destination after they enter a room code.
 */
export async function getRoomStatus(roomId: string): Promise<RoomStatus | null> {
  const snapshot = await get(ref(database, `rooms/${roomId}/room`));
  const data = snapshot.val();
  if (!data) return null;
  try {
    return deserializeRoom(data).status;
  } catch {
    return data.status === 'started' ? 'started' : 'lobby';
  }
}

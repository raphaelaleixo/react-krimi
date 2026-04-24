import { Navigate } from 'react-router-dom';
import { MOCK_ROOM_STATE } from '../mocks/krimiFixture';

export default function MockPlayerInvestigator() {
  return <Navigate to={`/mock-player/${MOCK_ROOM_STATE.roomId}/2`} replace />;
}

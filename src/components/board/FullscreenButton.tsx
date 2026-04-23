import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { useFullscreen } from 'react-gameroom';
import { useI18n } from '../../hooks/useI18n';
import TapedNoteButton from './TapedNoteButton';

export default function FullscreenButton() {
  const { isFullscreen, isSupported, toggle } = useFullscreen();
  const { t } = useI18n();

  if (!isSupported) return null;

  const label = isFullscreen ? t('Exit fullscreen') : t('Enter fullscreen');

  return (
    <TapedNoteButton
      variant="icon-button"
      rotation={-2}
      onClick={toggle}
      aria-label={label}
    >
      {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
    </TapedNoteButton>
  );
}

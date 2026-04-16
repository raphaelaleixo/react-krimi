import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import type { PlayerSlot } from 'react-gameroom';
import type { KrimiPlayerData } from '../types';

interface LobbyPlayersProps {
  players: PlayerSlot<KrimiPlayerData>[];
  activeDetective: number;
  onChangeDetective: (index: number) => void;
}

export default function LobbyPlayers({
  players,
  activeDetective,
  onChangeDetective,
}: LobbyPlayersProps) {
  return (
    <Card>
      <CardContent>
        <List>
          {players.map((player, index) => (
            <ListItem key={player.id}>
              <ListItemText
                primary={player.name || `Player ${player.id}`}
              />
              <ListItemSecondaryAction>
                <IconButton
                  onClick={() => onChangeDetective(index)}
                  sx={{
                    color: index === activeDetective ? 'secondary.main' : 'grey.400',
                  }}
                >
                  <LocalPoliceIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

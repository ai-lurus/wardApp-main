import { Avatar, Box, Card, CardContent, Divider, Typography } from '@mui/material';
import { useAuthContext } from 'src/contexts/auth-context';

const roleLabel = {
  super_admin: 'Super Admin',
  admin: 'Administrador',
  almacenista: 'Almacenista',
  operator: 'Operador',
};

function getInitials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const AccountProfile = () => {
  const { user } = useAuthContext();

  return (
    <Card>
      <CardContent>
        <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
          <Avatar
            sx={{
              height: 80,
              mb: 2,
              width: 80,
              bgcolor: 'primary.main',
              fontSize: 28,
            }}
          >
            {getInitials(user?.name)}
          </Avatar>
          <Typography gutterBottom variant="h5">
            {user?.name}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {user?.email}
          </Typography>
        </Box>
      </CardContent>
      <Divider />
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          {roleLabel[user?.role] ?? user?.role}
        </Typography>
      </Box>
    </Card>
  );
};

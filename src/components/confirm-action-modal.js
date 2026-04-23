import {
  Box,
  Button,
  Modal,
  Stack,
  Typography
} from '@mui/material';
import ExclamationTriangleIcon from '@heroicons/react/24/solid/ExclamationTriangleIcon';
import ArrowPathIcon from '@heroicons/react/24/solid/ArrowPathIcon';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export const ConfirmActionModal = ({
  open,
  onClose,
  onConfirm,
  title = "¿Estás seguro?",
  description = "Esta acción desactivará el registro y no podrá verse en la lista principal.",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  color = "error", // "error" | "success" | "primary"
  iconType = "warning" // "warning" | "info"
}) => {
  return (
    <Modal open={open}
      onClose={onClose}>
      <Box sx={modalStyle}>
        <Stack spacing={3}
          alignItems="center"
          textAlign="center">
          <Box
            sx={{
              bgcolor: `${color}.light`,
              color: `${color}.main`,
              p: 2,
              borderRadius: '50%',
              display: 'flex'
            }}
          >
            {iconType === 'warning' ? (
              <ExclamationTriangleIcon style={{ width: 32 }} />
            ) : (
              <ArrowPathIcon style={{ width: 32, color: 'white' }} />
            )}
          </Box>

          <Box>
            <Typography variant="h6"
              mb={1}>{title}</Typography>
            <Typography variant="body2"
              color="text.secondary">
              {description}
            </Typography>
          </Box>

          <Stack direction="row"
            spacing={2}
            width="100%">
            <Button
              fullWidth
              variant="outlined"
              onClick={onClose}
            >
              {cancelText}
            </Button>
            <Button
              fullWidth
              variant="contained"
              color={color}
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
};

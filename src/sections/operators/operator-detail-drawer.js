import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
  TextField,
  MenuItem,
  CircularProgress
} from '@mui/material';
import XMarkIcon from '@heroicons/react/24/solid/XMarkIcon';
import TrashIcon from '@heroicons/react/24/solid/TrashIcon';
import { operatorsApi } from 'src/services/apiService';
import { SecureFile } from 'src/components/secure-file';
import format from 'date-fns/format';

export const OperatorDetailDrawer = ({ open, onClose, operatorId }) => {
  const [operator, setOperator] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form states for upload
  const [docType, setDocType] = useState('ine');
  const [expiryDate, setExpiryDate] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (open && operatorId) {
      setLoading(true);
      operatorsApi.get(operatorId)
        .then(data => {
          if (mounted) setOperator(data);
        })
        .catch(err => console.error(err))
        .finally(() => {
          if (mounted) setLoading(false);
        });
    } else {
      setOperator(null);
      setDocType('ine');
      setExpiryDate('');
      setSelectedFile(null);
    }
    return () => { mounted = false; };
  }, [open, operatorId]);

  const handleUpload = async () => {
    if (!selectedFile || !docType) return;

    // Validate size (50MB)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (selectedFile.size > MAX_SIZE) {
      alert('El archivo es demasiado grande. El límite es de 50MB.');
      return;
    }

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert('Tipo de archivo no permitido. Solo se aceptan JPG, PNG y PDF.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('document_type', docType);
      if (expiryDate) {
        formData.append('expiry_date', expiryDate);
      }
      formData.append('file', selectedFile);

      await operatorsApi.uploadDocument(operatorId, formData);
      // Reload operator to get new document list
      const updatedOperator = await operatorsApi.get(operatorId);
      setOperator(updatedOperator);
      setSelectedFile(null);
      setExpiryDate('');
    } catch (err) {
      console.error('Failed to upload', err);
      alert('Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('¿Eliminar este documento?')) return;
    try {
      await operatorsApi.deleteDocument(operatorId, docId);
      setOperator(prev => ({
        ...prev,
        documents: prev.documents.filter(d => d.id !== docId)
      }));
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el documento');
    }
  };

  const documentTypeLabels = {
    ine: 'Identificación Oficial (INE)',
    contract: 'Contrato',
    license: 'Licencia'
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 500 }, p: 3 } }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h6">Detalles del Operador</Typography>
        <IconButton onClick={onClose}>
          <XMarkIcon style={{ width: 24 }} />
        </IconButton>
      </Stack>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : operator ? (
        <Stack spacing={4}>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">{operator.name}</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Licencia: {operator.licenseNumber} (Tipo {operator.licenseType})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vigencia: {operator.licenseExpiry ? format(new Date(operator.licenseExpiry), 'dd/MM/yyyy') : '—'}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" mb={2}>Documentos ({operator.documents?.length || 0})</Typography>
            <List disablePadding>
              {operator.documents?.map(doc => (
                <ListItem key={doc.id} disableGutters>
                  <ListItemText
                    primary={documentTypeLabels[doc.documentType] || doc.documentType}
                    secondary={doc.expiryDate ? `Vence: ${format(new Date(doc.expiryDate), 'dd/MM/yyyy')}` : ''}
                  />
                  <Stack direction="row" spacing={1} alignItems="center">
                    <SecureFile path={doc.fileUrl} fileName="Descargar" />
                    <IconButton size="small" color="error" onClick={() => handleDeleteDoc(doc.id)}>
                      <TrashIcon style={{ width: 16 }} />
                    </IconButton>
                  </Stack>
                </ListItem>
              ))}
              {(!operator.documents || operator.documents.length === 0) && (
                <Typography variant="body2" color="text.secondary">No hay documentos registrados.</Typography>
              )}
            </List>
          </Box>

          <Box sx={{ bgcolor: 'neutral.50', p: 2, borderRadius: 1 }}>
            <Typography variant="subtitle2" mb={2}>Subir Nuevo Documento</Typography>
            <Stack spacing={2}>
              <TextField
                select
                label="Tipo de Documento"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                size="small"
                fullWidth
              >
                <MenuItem value="ine">{documentTypeLabels.ine}</MenuItem>
                <MenuItem value="contract">{documentTypeLabels.contract}</MenuItem>
                <MenuItem value="license">{documentTypeLabels.license}</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label="Fecha de Vencimiento (opcional)"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />

              <Button
                variant="outlined"
                component="label"
                fullWidth
              >
                Seleccionar Archivo
                <input
                  type="file"
                  hidden
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
              </Button>
              {selectedFile && (
                <Typography variant="caption" color="text.secondary">
                  Archivo seleccionado: {selectedFile.name}
                </Typography>
              )}

              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? 'Subiendo...' : 'Subir Documento'}
              </Button>
            </Stack>
          </Box>
        </Stack>
      ) : (
        <Typography color="error">Error al cargar el operador.</Typography>
      )}
    </Drawer>
  );
};

OperatorDetailDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  operatorId: PropTypes.string
};

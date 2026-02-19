import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import { SeverityPill } from 'src/components/severity-pill';
import { useTranslation } from 'react-i18next';

export const AlertsTable = ({ items = [], onRegisterEntry, compact = false }) => {
  const { t } = useTranslation();

  if (items.length === 0) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">{t('noAlerts')}</Typography>
      </Card>
    );
  }

  return (
    <Card>
      <Scrollbar>
        <Box sx={{ minWidth: compact ? 400 : 700 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('material')}</TableCell>
                <TableCell>{t('category')}</TableCell>
                <TableCell align="right">{t('currentStock')}</TableCell>
                <TableCell align="right">{t('minStock')}</TableCell>
                <TableCell align="right">{t('deficit')}</TableCell>
                <TableCell>{t('status')}</TableCell>
                {!compact && <TableCell>{t('actions')}</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow hover key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.categoryName}</TableCell>
                  <TableCell align="right">{item.currentStock}</TableCell>
                  <TableCell align="right">{item.minStock}</TableCell>
                  <TableCell align="right">{item.deficit}</TableCell>
                  <TableCell>
                    <SeverityPill color={item.currentStock === 0 ? 'error' : 'warning'}>
                      {item.currentStock === 0 ? 'Sin stock' : t('lowStock')}
                    </SeverityPill>
                  </TableCell>
                  {!compact && (
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        onClick={() => onRegisterEntry(item.id)}
                      >
                        {t('registerEntry')}
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Scrollbar>
    </Card>
  );
};

AlertsTable.propTypes = {
  items: PropTypes.array,
  onRegisterEntry: PropTypes.func,
  compact: PropTypes.bool,
};

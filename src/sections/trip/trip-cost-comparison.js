import { useMemo } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper, Alert
} from '@mui/material';
import ArrowUpIcon from '@heroicons/react/24/solid/ArrowUpIcon';
import ArrowDownIcon from '@heroicons/react/24/solid/ArrowDownIcon';

export const TripCostComparison = ({ estimatedCosts = {}, actualCosts = {} }) => {
  const rows = useMemo(() => {
    const concepts = [
      { id: 'tollbooth', label: 'Casetas' },
      { id: 'fuel', label: 'Combustible' },
      { id: 'insurance', label: 'Seguro' },
      { id: 'extras', label: 'Extras' }
    ];

    let totalEstimated = 0;
    let totalActual = 0;

    const items = concepts.map(concept => {
      const est = Number(estimatedCosts[concept.id]) || 0;
      const act = Number(actualCosts[concept.id]) || 0;
      const diff = act - est;
      const diffPercent = est > 0 ? (diff / est) * 100 : (act > 0 ? 100 : 0);

      totalEstimated += est;
      totalActual += act;

      return {
        ...concept,
        est,
        act,
        diff,
        diffPercent
      };
    });

    const totalDiff = totalActual - totalEstimated;
    const totalDiffPercent = totalEstimated > 0 ? (totalDiff / totalEstimated) * 100 : (totalActual > 0 ? 100 : 0);

    return {
      items,
      total: { est: totalEstimated, act: totalActual, diff: totalDiff, diffPercent: totalDiffPercent }
    };
  }, [estimatedCosts, actualCosts]);

  const { items, total } = rows;
  const hasOvercost = total.diff > 0;

  let severity = "info";
  if (total.diff > 0) severity = "warning";
  else if (total.diff < 0) severity = "success";
  else severity = "success"; // exact

  return (
    <Box sx={{ mt: 2 }}>
      <Alert
        severity={severity}
        sx={{ mb: 2, alignItems: 'center' }}
      >
        <Typography variant="subtitle2"
          sx={{ fontWeight: 600 }}>
          {total.diff > 0
            ? `Viaje con sobrecosto ⚠️ +$${total.diff.toLocaleString('es-MX', { minimumFractionDigits: 2 })} (+${total.diffPercent.toFixed(1)}%)`
            : total.diff < 0
              ? `Viaje dentro del presupuesto ✅ -$${Math.abs(total.diff).toLocaleString('es-MX', { minimumFractionDigits: 2 })} (${total.diffPercent.toFixed(1)}%)`
              : "Viaje dentro del presupuesto ✅"}
        </Typography>
      </Alert>

      <Paper variant="outlined"
        sx={{ overflow: 'hidden' }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              <TableCell>Concepto</TableCell>
              <TableCell align="right">Estimado</TableCell>
              <TableCell align="right">Real</TableCell>
              <TableCell align="right">Diferencia ($)</TableCell>
              <TableCell align="right">Diferencia (%)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((row) => {
              let color = 'text.primary';
              if (row.diff > 0) color = 'error.main';
              else if (row.diff < 0) color = 'success.main';

              return (
                <TableRow key={row.id}>
                  <TableCell component="th"
                    scope="row">
                    {row.label}
                  </TableCell>
                  <TableCell align="right">${row.est.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell align="right">${row.act.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell align="right"
                    sx={{ color, fontWeight: 500 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                      {row.diff !== 0 && (
                        row.diff > 0 ? <ArrowUpIcon width={14}
                          height={14} /> : <ArrowDownIcon width={14}
                            height={14} />
                      )}
                      {row.diff > 0 ? '+' : (row.diff < 0 ? '-' : '')}${Math.abs(row.diff).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </Box>
                  </TableCell>
                  <TableCell align="right"
                    sx={{ color, fontWeight: 500 }}>
                    {row.diff > 0 ? '+' : ''}{row.diffPercent.toFixed(1)}%
                  </TableCell>
                </TableRow>
              );
            })}
            {/* Fila de Total */}
            <TableRow sx={{ '& td': { fontWeight: 'bold', borderTop: '2px solid', borderColor: 'divider' } }}>
              <TableCell>Total</TableCell>
              <TableCell align="right">${total.est.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</TableCell>
              <TableCell align="right">${total.act.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</TableCell>
              <TableCell align="right"
                sx={{ color: total.diff > 0 ? 'error.main' : (total.diff < 0 ? 'success.main' : 'text.primary') }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                  {total.diff !== 0 && (
                    total.diff > 0 ? <ArrowUpIcon width={14}
                      height={14} /> : <ArrowDownIcon width={14}
                        height={14} />
                  )}
                  {total.diff > 0 ? '+' : (total.diff < 0 ? '-' : '')}${Math.abs(total.diff).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </Box>
              </TableCell>
              <TableCell align="right"
                sx={{ color: total.diff > 0 ? 'error.main' : (total.diff < 0 ? 'success.main' : 'text.primary') }}>
                {total.diff > 0 ? '+' : ''}{total.diffPercent.toFixed(1)}%
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

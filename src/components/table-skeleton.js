import PropTypes from 'prop-types';
import {
    Box,
    Card,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';

export const TableSkeleton = ({ rowCount = 5, colCount = 5 }) => {
    return (
        <Card>
            <Scrollbar>
                <Box sx={{ minWidth: 800 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {Array.from(new Array(colCount)).map((_, index) => (
                                    <TableCell key={`header-skeleton-${index}`}>
                                        <Skeleton variant="text" sx={{ fontSize: '1rem', width: '60%' }} />
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Array.from(new Array(rowCount)).map((_, rowIndex) => (
                                <TableRow hover key={`row-skeleton-${rowIndex}`}>
                                    {Array.from(new Array(colCount)).map((_, colIndex) => (
                                        <TableCell key={`cell-skeleton-${rowIndex}-${colIndex}`}>
                                            <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            </Scrollbar>
        </Card>
    );
};

TableSkeleton.propTypes = {
    rowCount: PropTypes.number,
    colCount: PropTypes.number,
};

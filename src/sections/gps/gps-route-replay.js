import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { format, startOfDay, subDays } from 'date-fns';
import es from 'date-fns/locale/es';
import PauseIcon from '@heroicons/react/24/solid/PauseIcon';
import PlayIcon from '@heroicons/react/24/solid/PlayIcon';
import {
  Box,
  ButtonBase,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  IconButton,
  Skeleton,
  Slider,
  Stack,
  SvgIcon,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { gpsApi } from 'src/services/apiService';
import { GpsFleetMap } from './gps-fleet-map';

const DAYS_BACK = 7;
const TICK_MS = 100;
// At 1x one real second plays one recorded minute.
const RECORDED_MS_PER_REAL_MS = 60;
const SPEEDS = [1, 2, 4, 8];
const REPLAY_LAYERS = { geofences: true, hotspots: true, traffic: false };

const EVENT_COLORS = {
  geofence: 'info',
  stop: 'warning',
  fuel: 'primary',
  speeding: 'error',
  signal: 'error',
  alert: 'error',
};

const dayOptions = () =>
  Array.from({ length: DAYS_BACK }, (_, index) => {
    const day = startOfDay(subDays(new Date(), index));
    const label = index === 0 ? 'Hoy' : index === 1 ? 'Ayer' : format(day, "EEE dd/MM", { locale: es });
    return { value: day.toISOString(), label };
  });

// Position, heading and speed at time t, interpolated between the two closest samples.
const sampleAt = (samples, t) => {
  const index = samples.findIndex((sample) => sample.t >= t);
  if (index <= 0) return samples[Math.max(index, 0)] || samples[samples.length - 1];
  const a = samples[index - 1];
  const b = samples[index];
  const k = (t - a.t) / (b.t - a.t || 1);
  return {
    ...a,
    t,
    position: [a.position[0] + (b.position[0] - a.position[0]) * k, a.position[1] + (b.position[1] - a.position[1]) * k],
    progress: a.progress + (b.progress - a.progress) * k,
    speed: Math.round(a.speed + (b.speed - a.speed) * k),
  };
};

/**
 * Route replay for one unit: pick a day, then play, pause, change speed or drag the timeline.
 * Events on the timeline (stops, fuel, geofences, alerts) jump to their moment when clicked.
 * `initialAt` (ISO) opens on that moment, e.g. when coming from an alert.
 */
export const GpsRouteReplay = ({ unit, cities = {}, overlays, initialAt = null }) => {
  const days = useMemo(dayOptions, []);
  const initialDay = initialAt ? startOfDay(new Date(initialAt)).toISOString() : days[0].value;
  const [day, setDay] = useState(days.some((d) => d.value === initialDay) ? initialDay : days[0].value);
  const [track, setTrack] = useState(null);
  const [t, setT] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const pendingAt = useRef(initialAt);
  const cardRef = useRef(null);

  useEffect(() => {
    if (initialAt) cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [initialAt]);

  useEffect(() => {
    let active = true;
    setTrack(null);
    setPlaying(false);
    gpsApi.getUnitTrack(unit.id, day).then((result) => {
      if (!active || !result) return;
      setTrack(result);
      const requested = pendingAt.current ? new Date(pendingAt.current).getTime() : null;
      pendingAt.current = null;
      setT(requested ? Math.min(result.end, Math.max(result.start, requested)) : result.start);
    });
    return () => {
      active = false;
    };
  }, [unit.id, day]);

  useEffect(() => {
    if (!playing || !track) return undefined;
    const timer = setInterval(() => {
      setT((current) => Math.min(track.end, current + TICK_MS * RECORDED_MS_PER_REAL_MS * speed));
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [playing, speed, track]);

  // Stop at the end of the day.
  useEffect(() => {
    if (playing && track && t >= track.end) setPlaying(false);
  }, [playing, track, t]);

  const current = track && t !== null ? sampleAt(track.samples, t) : null;
  const replayUnit = current
    ? {
      ...unit,
      position: current.position,
      heading: current.heading,
      progress: current.progress,
      currentSpeed: current.speed,
      status: current.speed > 0 ? 'moving' : 'stopped',
    }
    : null;
  const span = track ? track.end - track.start || 1 : 1;

  const jumpTo = (time) => {
    setPlaying(false);
    setT(time);
  };

  const togglePlay = () => {
    if (!track) return;
    if (!playing && t >= track.end) setT(track.start);
    setPlaying((value) => !value);
  };

  return (
    <Card ref={cardRef}
id="recorrido"
sx={{ scrollMarginTop: 16 }}>
      <CardHeader
        title="Reproducir recorrido"
        subheader="Elige un día y recorre lo que hizo la unidad"
        action={(
          <Stack direction="row"
sx={{ flexWrap: 'wrap', gap: 0.75, justifyContent: 'flex-end', maxWidth: 520 }}>
            {days.map((option) => (
              <Chip
                key={option.value}
                size="small"
                label={option.label}
                color={option.value === day ? 'primary' : 'default'}
                variant={option.value === day ? 'filled' : 'outlined'}
                onClick={() => setDay(option.value)}
                aria-pressed={option.value === day}
              />
            ))}
          </Stack>
        )}
        sx={{ flexWrap: 'wrap', gap: 1, '& .MuiCardHeader-action': { m: 0 } }}
      />
      <Divider />
      {!track || !replayUnit ? (
        <Skeleton variant="rectangular"
height={520} />
      ) : (
        <>
          <GpsFleetMap
            units={[replayUnit]}
            routes={[unit.route]}
            cities={cities}
            selectedId={unit.id}
            focusPoints={unit.route.points}
            height={400}
            aspectRatio={1.6}
            geofences={overlays.geofences}
            hotspots={overlays.hotspots}
            traffic={overlays.traffic}
            layers={REPLAY_LAYERS}
            animateUnits={false}
          />
          <CardContent>
            <Stack spacing={1.5}>
              <Stack direction={{ xs: 'column', sm: 'row' }}
spacing={2}
alignItems={{ sm: 'center' }}
justifyContent="space-between">
                <Stack direction="row"
spacing={1.5}
alignItems="center">
                  <IconButton
                    color="primary"
                    onClick={togglePlay}
                    aria-label={playing ? 'Pausar' : 'Reproducir'}
                    sx={{ border: 1, borderColor: 'divider' }}
                  >
                    <SvgIcon>{playing ? <PauseIcon /> : <PlayIcon />}</SvgIcon>
                  </IconButton>
                  <Box>
                    <Typography variant="h6">{format(new Date(t), 'HH:mm')}</Typography>
                    <Typography variant="body2"
color="text.secondary">
                      {current.speed > 0 ? `${current.speed} km/h` : 'Detenida'} · Avance {Math.round(current.progress * 100)}%
                    </Typography>
                  </Box>
                </Stack>
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={speed}
                  onChange={(event, value) => value && setSpeed(value)}
                  aria-label="Velocidad de reproducción"
                >
                  {SPEEDS.map((value) => (
                    <ToggleButton key={value}
value={value}
sx={{ px: 1.5 }}>
                      {value}x
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Stack>

              <Box sx={{ position: 'relative', height: 20, mx: 1 }}
aria-label="Eventos del día">
                {track.events.map((event, index) => (
                  <Tooltip key={`${event.t}-${index}`}
title={`${format(new Date(event.t), 'HH:mm')} · ${event.label}`}>
                    <ButtonBase
                      onClick={() => jumpTo(event.t)}
                      aria-label={`${format(new Date(event.t), 'HH:mm')} ${event.label}`}
                      sx={{
                        position: 'absolute',
                        left: `${((event.t - track.start) / span) * 100}%`,
                        top: 4,
                        width: 12,
                        height: 12,
                        ml: '-6px',
                        borderRadius: '50%',
                        backgroundColor: `${EVENT_COLORS[event.type] || 'primary'}.main`,
                        border: 2,
                        borderColor: 'background.paper',
                        boxShadow: 1,
                      }}
                    />
                  </Tooltip>
                ))}
              </Box>
              <Slider
                value={t}
                min={track.start}
                max={track.end}
                step={60000}
                onChange={(event, value) => jumpTo(value)}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => format(new Date(value), 'HH:mm')}
                aria-label="Hora del recorrido"
                sx={{ mx: 1, width: 'calc(100% - 16px)' }}
              />
              <Stack direction="row"
justifyContent="space-between">
                <Typography variant="caption"
color="text.secondary">
                  {format(new Date(track.start), 'HH:mm')}
                </Typography>
                <Typography variant="caption"
color="text.secondary">
                  {format(new Date(track.end), 'HH:mm')}
                </Typography>
              </Stack>

              <Divider />
              <Typography variant="subtitle2">Eventos ({track.events.length})</Typography>
              <Stack sx={{ maxHeight: 220, overflowY: 'auto' }}>
                {track.events.map((event, index) => (
                  <ButtonBase
                    key={`${event.t}-${index}-row`}
                    onClick={() => jumpTo(event.t)}
                    sx={{ justifyContent: 'flex-start', textAlign: 'left', px: 1, py: 0.75, borderRadius: 1, '&:hover': { backgroundColor: 'action.hover' } }}
                  >
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', mr: 1.5, flexShrink: 0, backgroundColor: `${EVENT_COLORS[event.type] || 'primary'}.main` }} />
                    <Typography variant="body2"
sx={{ minWidth: 48, color: 'text.secondary' }}>
                      {format(new Date(event.t), 'HH:mm')}
                    </Typography>
                    <Typography variant="body2">{event.label}</Typography>
                  </ButtonBase>
                ))}
              </Stack>
            </Stack>
          </CardContent>
        </>
      )}
    </Card>
  );
};

GpsRouteReplay.propTypes = {
  unit: PropTypes.object.isRequired,
  cities: PropTypes.object,
  overlays: PropTypes.object,
  initialAt: PropTypes.string,
};

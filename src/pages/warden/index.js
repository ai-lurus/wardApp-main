// Warden standalone page — /warden route. Wraps WardenPageView in the
// authenticated layout. Implementation lands in T057 (US1).
import WardenPageView from '../../sections/warden/warden-page-view';

export default function WardenPage() {
  return <WardenPageView />;
}

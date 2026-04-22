import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { SubscriptionGuard } from 'src/guards/subscription-guard';
import { useWardenStream } from 'src/hooks/use-warden-stream';
import WardenPageView from 'src/sections/warden/warden-page-view';

const WardenPage = () => {
  const { sendMessage, status } = useWardenStream();
  return <WardenPageView onSend={sendMessage} streamStatus={status} />;
};

WardenPage.getLayout = (page) => (
  <DashboardLayout>
    <SubscriptionGuard moduleId="warden">{page}</SubscriptionGuard>
  </DashboardLayout>
);

export default WardenPage;

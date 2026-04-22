import { DashboardLayout } from 'src/layouts/dashboard/layout';
import { useWardenStream } from 'src/hooks/use-warden-stream';
import WardenPageView from 'src/sections/warden/warden-page-view';

const WardenPage = () => {
  const { sendMessage, status } = useWardenStream();
  return <WardenPageView onSend={sendMessage} streamStatus={status} />;
};

WardenPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default WardenPage;

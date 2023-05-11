import Layout from '~/components/common/Layout'
import Head from 'next/head'
import DataTable from '~/components/users/Table'
import TopNavbar from '~/components/common/TopNavbar'
import withAuth, {type BaseProps} from '~/utils/withAuth'

const AdminUserPage: React.FC<BaseProps> = ({session}) => {
  return (
    <>
      <Head>
        <title>Atlas | Users</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="The login page for Atlas" />
      </Head>
      <TopNavbar isAdmin={session.isAdmin} />
      <Layout>
        <DataTable />
      </Layout>
    </>
  )
}

export default withAuth(AdminUserPage, true)

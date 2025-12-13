
import DashboardStats from "@/components/dashboard/DashboardStats";
import EarningGrowthChart from "@/components/dashboard/EarningGrowthChart";
import UserGrowthChart from "@/components/dashboard/UserGrowthChart";
import ChartSkeleton from "@/components/skeleton/ChartSkeleton";
import DashboardStatsSkeleton from "@/components/skeleton/DashboardStatsSkeleton";
import PageLayout from "@/components/main-layout/PageLayout";
import TableSkeleton from "@/components/skeleton/TableSkeleton";
import { Button } from "@/components/ui/button";
import usePaginatedSearchQuery from "@/hooks/usePaginatedSearchQuery";
import {
    useGetDashboardEarningChartQuery,
    useGetDashboardStatsQuery,
    useGetDashboardUserChartQuery
} from "@/redux/feature/dashboard/dashboardApi";
import { MoveRight } from "lucide-react";
import { Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import OrderTable from "@/components/order/table/Ordertable";
import { useGetAllOrderQuery, useUpdateOrderMutation } from "@/redux/feature/order/orderApi";
import { toast } from "sonner";
import OrderViewModal from "@/components/order/modal/OrderViewModal";

const Dashboard = () => {
    const { t } = useTranslation('dashboard');
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    // Year State
    const [userYear, setUserYear] = useState(new Date().getFullYear());
    const [earningYear, setEarningYear] = useState(new Date().getFullYear());

    // API Queries
    const { data: dashboardStatsData, isLoading: isStatsLoading } = useGetDashboardStatsQuery();
    const { data: userGrowthData, isLoading: isUserGrowthLoading } = useGetDashboardUserChartQuery({ years: userYear });
    const { data: earningData, isLoading: isEarningLoading } = useGetDashboardEarningChartQuery({ years: earningYear });

    const {
        items: orders,
        page,
        isLoading,
        isError,
    } = usePaginatedSearchQuery(useGetAllOrderQuery, { resultsKey: "orders" });
    const pendingOrders = orders?.filter((company) => company.status === 'pending');
    const [updateOrder] = useUpdateOrderMutation();

    const handleStatusChange = async (orderId, status) => {
        toast.promise(
            updateOrder({ orderId, status }).unwrap(),
            {
                loading: t('toast.loading'),
                success: t('toast.success', { status }),
                error: t('toast.error'),
            }
        );
    };

    // Year Change Handlers
    const handleUserYearChange = (year) => setUserYear(parseInt(year));
    const handleEarningYearChange = (year) => setEarningYear(parseInt(year));

    return (
        <Suspense fallback={
            <>
                <DashboardStatsSkeleton />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                    <ChartSkeleton />
                    <ChartSkeleton />
                </div>
            </>
        }>
            <PageLayout>
                {/* Stats */}
                {isStatsLoading ? <DashboardStatsSkeleton /> : <DashboardStats data={dashboardStatsData?.data} />}

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                    {isUserGrowthLoading ?
                        <ChartSkeleton /> :
                        <UserGrowthChart
                            userGrowthChartData={userGrowthData}
                            onYearChange={handleUserYearChange}
                            selectedYear={userYear}
                        />}
                    {isEarningLoading ?
                        <ChartSkeleton /> :
                        <EarningGrowthChart
                            earningGrowthChartData={earningData}
                            onYearChange={handleEarningYearChange}
                            selectedYear={earningYear}
                        />}
                </div>

                {/* Table */}
                <div className="mt-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">{t('pending_request')}</h3>
                        <Link
                            to="/order-management"
                            className="text-primary hover:underline text-sm font-medium"
                        >
                            <Button variant="ghost">{t('view_all')} <MoveRight /></Button>
                        </Link>
                    </div>
                    {
                        isLoading ?
                            <TableSkeleton columns={3} rows={4} />
                            : isError ?
                                <p className="text-center text-red-500">{t('failed_to_load_companies')}</p>
                                : pendingOrders?.length > 0 ? (
                                    <OrderTable
                                        data={pendingOrders}
                                        onStatusChange={handleStatusChange}
                                        onView={(order) => {
                                            setSelectedOrder(order);
                                            setIsViewModalOpen(true);
                                        }}
                                        updateLoading={false}
                                        deleteLoading={false}
                                        page={page}
                                        limit={4}
                                        isActionButton={false}
                                    />
                                ) : (
                                    <p className="text-center text-muted-foreground">{t('no_pending_requests')}</p>
                                )
                    }
                </div>
            </PageLayout>
            <OrderViewModal
                isOpen={isViewModalOpen}
                onOpenChange={setIsViewModalOpen}
                order={selectedOrder} />
        </Suspense>
    );
};

export default Dashboard;

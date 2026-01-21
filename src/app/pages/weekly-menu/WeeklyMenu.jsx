import React, { useState, Suspense } from 'react';
import { Plus, Search } from 'lucide-react';
import Title from '@/components/ui/Title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageLayout from '@/components/main-layout/PageLayout';
import CustomPagination from '@/components/common/CustomPagination';
import TableSkeleton from '@/components/skeleton/TableSkeleton';
import MenuTable from '@/components/menu/table/MenuTable';
import AddMenuModal from '@/components/menu/modal/AddMenuModal';
import EditMenuModal from '@/components/menu/modal/EditMenuModal';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { useTranslation } from 'react-i18next';

import {
    useGetAllMenuQuery,
    useAddMenuMutation,
    useUpdateMenuMutation,
    useDeleteMenuMutation
} from '@/redux/feature/menu/menuApi';
import usePaginatedSearchQuery from '@/hooks/usePaginatedSearchQuery';
import Error from '@/components/common/Error';
import NoData from '@/components/common/NoData';
import ViewMenuModal from '@/components/menu/modal/ViewMenuModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SuccessToast } from '@/lib/utils';

const WeeklyMenu = () => {
    const { t } = useTranslation('weekly_menu');
    const [filters, setFilters] = useState({});

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value === 'all' ? '' : value
        }));
    };
    
    const {
        searchTerm,
        setSearchTerm,
        currentPage,
        setCurrentPage,
        items: menus,
        meta,
        page,
        isLoading,
        isError
    } = usePaginatedSearchQuery(useGetAllMenuQuery, { resultsKey: "menus" }, filters);
    const {total, limit} = meta || {};
    const totalPages = Math.ceil(total / limit);

    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState(null);

    const [addMenuMutation, { isLoading: addLoading }] = useAddMenuMutation();
    const [updateMenuMutation, { isLoading: updateLoading }] = useUpdateMenuMutation();
    const [deleteMenuMutation, { isLoading: deleteLoading }] = useDeleteMenuMutation();

    // Modal Handlers
    const handleAddMenu = async (formData) => {
        try {
            await addMenuMutation(formData).unwrap();
            setAddOpen(false);
            SuccessToast("Menu created successfully")
        } catch (err) {
            console.error('Add menu failed:', err);
            throw err;
        }
    };

    const handleEditMenu = async (formData) => {
        if (!selectedMenu?._id) return;
        try {
            await updateMenuMutation({ id: selectedMenu._id, data: formData }).unwrap();
            setEditOpen(false);
            setSelectedMenu(null);
        } catch (err) {
            console.error('Update menu failed:', err);
            throw err;
        }
    };

    const handleDeleteMenu = async () => {
        if (!selectedMenu?._id) return;
        try {
            await deleteMenuMutation(selectedMenu._id).unwrap();
            setConfirmOpen(false);
            setSelectedMenu(null);
        } catch (err) {
            console.error('Delete menu failed:', err);
        }
    };

    return (
        <>
            <Suspense fallback={<TableSkeleton columns={4} rows={10} />}>
                <PageLayout
                    pagination={
                        totalPages > 1 && (
                            <div className="mt-4">
                                <CustomPagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        )
                    }
                >
                    {/* Title and Search */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
                        <Title title={t('title')} />
                        <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto">
                            <Select
                                value={filters.mealType}
                                onValueChange={(value) => handleFilterChange('mealType', value)}>
                                <SelectTrigger className="w-full sm:w-fit">
                                    <SelectValue placeholder={t('select_meal_type')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('all_meal_type')}</SelectItem>
                                    <SelectItem value="Sopa">{t('soup')}</SelectItem>
                                    <SelectItem value="Plato_Principal">{t('main_course')}</SelectItem>
                                    <SelectItem value="Guarnición">{t('side_dish')}</SelectItem>
                                    <SelectItem value="Postre">{t('dessert')}</SelectItem>
                                    <SelectItem value="Diabetes">{t('diabetes')}</SelectItem>
                                    <SelectItem value="Vegano">{t('vegano')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="relative w-full md:w-fit">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder={t('search_placeholder')}
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button onClick={() => setAddOpen(true)}>
                                <Plus />
                                {t('add_button')}
                            </Button>
                        </div>
                    </div>

                    {/* Table */}
                    {isLoading ? (
                        <TableSkeleton columns={4} rows={10} />
                    ) : isError ? (
                        <Error msg={t('error_load')} />
                    ) : menus?.length > 0 ? (
                        <MenuTable
                            page={page}
                            limit={10}
                            data={menus}
                            onView={(menu) => {
                                setSelectedMenu(menu);
                                setViewOpen(true);
                            }}
                            onEdit={(menu) => {
                                setSelectedMenu(menu);
                                setEditOpen(true);
                            }}
                            onDelete={(menu) => {
                                setSelectedMenu(menu);
                                setConfirmOpen(true);
                            }}
                        />
                    ) : (
                        <NoData msg={t('no_data')} />
                    )}
                </PageLayout>
            </Suspense>

            {/* Add Menu Modal */}
            <AddMenuModal
                isOpen={addOpen}
                onOpenChange={setAddOpen}
                onSubmit={handleAddMenu}
                loading={addLoading}
            />

            {/* View Menu Modal */}
            <ViewMenuModal
                isOpen={viewOpen}
                onOpenChange={setViewOpen}
                menu={selectedMenu}
            />

            {/* Edit Menu Modal */}
            <EditMenuModal
                isOpen={editOpen}
                onOpenChange={setEditOpen}
                menu={selectedMenu}
                onSubmit={handleEditMenu}
                loading={updateLoading}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmOpen}
                onOpenChange={setConfirmOpen}
                title={t('confirm_delete_title')}
                description={t('confirm_delete_description')}
                confirmText={t('delete')}
                loading={deleteLoading}
                onConfirm={handleDeleteMenu}
            />
        </>
    );
};

export default WeeklyMenu;
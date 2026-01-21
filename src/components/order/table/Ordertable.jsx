import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal } from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const OrderTable = ({ data, page, limit, onStatusChange, onView }) => {
  const { t } = useTranslation('order_management');

  // Helper to determine badge color based on status
  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'warning';
      case 'complete': return 'success';
      case 'cancel': return 'destructive';
      default: return 'outline';
    }
  };

  const getPaymentStatusVariant = (status) => {
    return status?.toLowerCase() === 'paid' ? 'success' : 'warning';
  };

  return (
    <div className="w-full overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('sn')}</TableHead>
            <TableHead>{t('customer')}</TableHead>
            <TableHead>{t('dish_name')}</TableHead> 
            <TableHead>{t('price')}</TableHead>
            <TableHead>{t('order_date')}</TableHead>
            <TableHead>{t('payment')}</TableHead>
            <TableHead>{t('order_status')}</TableHead>
            <TableHead className="text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((order, index) => (
            <TableRow key={order._id}>
              <TableCell>{(page - 1) * limit + index + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-9 w-9 border">
                    <AvatarImage src={order.user?.profile_image} />
                    <AvatarFallback>{getInitials(order.user?.name)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium whitespace-nowrap">{order.user?.name || 'N/A'}</span>
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap">{order.menus_id?.dishName || 'N/A'}</TableCell>
              <TableCell>${order.menus_id?.price?.toFixed(2) || '0.00'}</TableCell>
              <TableCell className="whitespace-nowrap">{formatDate(order.createdAt)}</TableCell>
              <TableCell>
                <Badge variant={getPaymentStatusVariant(order.paymentStatus)}>
                  {order.paymentStatus || 'N/A'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(order.status)}>
                  {order.status === "complete" ? "COMPLETED" : order.status.toUpperCase() || 'N/A'}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem disabled={order.status === 'pending'} onClick={() => onStatusChange(order._id, 'pending')}>
                      Mark as Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={order.status === 'complete'} onClick={() => onStatusChange(order._id, 'complete')}>
                      Mark as Complete
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={order.status === 'cancel'} onClick={() => onStatusChange(order._id, 'cancel')}>
                      Mark as Cancelled
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="icon" variant="outline" onClick={() => onView(order)}>
                  <Eye />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrderTable;
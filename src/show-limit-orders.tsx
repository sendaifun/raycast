import { ActionPanel, Action, List, showToast, Toast, Color, Icon } from "@raycast/api";
import { useState, useEffect } from "react";
import { executeAction } from "./utils/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";
import { LimitOrder } from "./type";

function formatAmount(amount: string): string {
  const num = parseFloat(amount);
  if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + "B";
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + "M";
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + "K";
  }
  return num.toFixed(4);
}

function formatAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

function getStatusColor(status: string): Color {
  switch (status.toLowerCase()) {
    case "active":
      return Color.Green;
    case "filled":
      return Color.Blue;
    case "cancelled":
      return Color.Red;
    case "expired":
      return Color.Orange;
    default:
      return Color.SecondaryText;
  }
}

function getStatusIcon(status: string): Icon {
  switch (status.toLowerCase()) {
    case "active":
      return Icon.Clock;
    case "filled":
      return Icon.CheckCircle;
    case "cancelled":
      return Icon.XMarkCircle;
    case "expired":
      return Icon.ExclamationMark;
    default:
      return Icon.Circle;
  }
}

const LimitOrderDetailMetadata = ({ order }: { order: LimitOrder }) => {
  return (
    <List.Item.Detail.Metadata>
      <List.Item.Detail.Metadata.Label title="Order ID" text={order.id} />
      <List.Item.Detail.Metadata.Label title="Maker" text={order.maker} />
      <List.Item.Detail.Metadata.Separator />
      <List.Item.Detail.Metadata.Label title="Input Token" text={order.inputMint} />
      <List.Item.Detail.Metadata.Label title="Output Token" text={order.outputMint} />
      <List.Item.Detail.Metadata.Separator />
      <List.Item.Detail.Metadata.Label title="Making Amount" text={order.makingAmount} />
      <List.Item.Detail.Metadata.Label title="Taking Amount" text={order.takingAmount} />
      <List.Item.Detail.Metadata.Separator />
      <List.Item.Detail.Metadata.Label title="Status" text={order.status} />
      <List.Item.Detail.Metadata.Label title="Created At" text={formatDate(order.createdAt)} />
      {order.expiredAt && <List.Item.Detail.Metadata.Label title="Expires At" text={formatDate(order.expiredAt)} />}
      <List.Item.Detail.Metadata.Separator />
      {order.filledMakingAmount && (
        <List.Item.Detail.Metadata.Label title="Filled Making Amount" text={order.filledMakingAmount} />
      )}
      {order.filledTakingAmount && (
        <List.Item.Detail.Metadata.Label title="Filled Taking Amount" text={order.filledTakingAmount} />
      )}
      {order.feeBps && <List.Item.Detail.Metadata.Label title="Fee (BPS)" text={order.feeBps.toString()} />}
      {order.slippageBps && (
        <List.Item.Detail.Metadata.Label title="Slippage (BPS)" text={order.slippageBps.toString()} />
      )}
    </List.Item.Detail.Metadata>
  );
};

const LimitOrderDetail = ({ order }: { order: LimitOrder }) => {
  const markdownContent = `
# Limit Order Details

**Order ID:** ${order.id}

**Status:** ${order.status}

**Trading Pair:**
- **Input:** ${formatAddress(order.inputMint)}
- **Output:** ${formatAddress(order.outputMint)}

**Amounts:**
- **Making:** ${formatAmount(order.makingAmount)}
- **Taking:** ${formatAmount(order.takingAmount)}

${order.filledMakingAmount ? `**Filled Making:** ${formatAmount(order.filledMakingAmount)}` : ""}
${order.filledTakingAmount ? `**Filled Taking:** ${formatAmount(order.filledTakingAmount)}` : ""}

**Timeline:**
- **Created:** ${formatDate(order.createdAt)}
${order.expiredAt ? `- **Expires:** ${formatDate(order.expiredAt)}` : ""}
  `;

  return <List.Item.Detail metadata={<LimitOrderDetailMetadata order={order} />} markdown={markdownContent} />;
};

const ShowLimitOrders = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<LimitOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<LimitOrder | null>(null);

  useEffect(() => {
    loadLimitOrders();
  }, []);

  async function loadLimitOrders() {
    try {
      setIsLoading(true);
      const result = await executeAction("showLimitOrders");
      setOrders(result.data as LimitOrder[]);
    } catch (error) {
      console.error(error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to load limit orders",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function cancelOrder(orderId: string) {
    try {
      await executeAction("cancelLimitOrder", { orderId });
      await showToast({
        style: Toast.Style.Success,
        title: "Success",
        message: "Limit order cancelled successfully",
      });
      // Refresh the list
      await loadLimitOrders();
    } catch (error) {
      console.error(error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to cancel limit order",
      });
    }
  }

  const getAccessories = (order: LimitOrder) => {
    if (selectedOrder) {
      return [
        {
          text: {
            value: order.status,
            color: getStatusColor(order.status),
            icon: getStatusIcon(order.status),
          },
        },
      ];
    }
    return [
      { text: formatAmount(order.makingAmount) },
      { text: "→" },
      { text: formatAmount(order.takingAmount) },
      {
        text: {
          value: order.status,
          color: getStatusColor(order.status),
          icon: getStatusIcon(order.status),
        },
      },
    ];
  };

  return (
    <List isLoading={isLoading} isShowingDetail={!!selectedOrder}>
      {orders.map((order) => (
        <List.Item
          key={order.id}
          title={`Order ${order.id.slice(0, 8)}...`}
          subtitle={
            !selectedOrder ? `${formatAddress(order.inputMint)} → ${formatAddress(order.outputMint)}` : undefined
          }
          detail={<LimitOrderDetail order={order} />}
          accessories={getAccessories(order)}
          actions={
            <ActionPanel>
              {!selectedOrder && <Action title="Show Details" onAction={() => setSelectedOrder(order)} />}
              {selectedOrder && <Action title="Hide Details" onAction={() => setSelectedOrder(null)} />}
              {order.status.toLowerCase() === "active" && (
                <Action
                  title="Cancel Order"
                  style={Action.Style.Destructive}
                  onAction={() => cancelOrder(order.id)}
                  shortcut={{ modifiers: ["cmd"], key: "delete" }}
                />
              )}
              <Action title="Refresh" onAction={loadLimitOrders} shortcut={{ modifiers: ["cmd"], key: "r" }} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

export default withAccessToken(provider)(ShowLimitOrders);

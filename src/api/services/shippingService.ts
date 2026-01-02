import api from "../axiosConfig";

interface ShippingFeeResponse {
  distance: number;
  duration: number;
  shippingFee: number;
  estimatedDeliveryTime: string;
}

class ShippingService {
  private readonly basePath = "/shipping";

  async calculateShippingFee(
    userAddress: string,
    orderTotal: number
  ): Promise<ShippingFeeResponse> {
    const response = await api.post<ShippingFeeResponse>(
      `${this.basePath}/calculate-fee`,
      {
        userAddress,
        orderTotal,
      }
    );
    return response.data;
  }
}

export default new ShippingService();

// class ShippingService {
//   private readonly basePath = "/shipping";

//   async calculateShippingFee(
//     userAddress: string,
//     orderTotal: number
//   ): Promise<ShippingFeeResponse> {
//     const response = await api.post<ShippingFeeResponse>(
//       `${this.basePath}/calculate-fee`,
//       {
//         userAddress,
//         orderTotal,
//       }
//     );
//     return response.data;
//   }
// }
// services/paymentService.ts
import api from "../axiosConfig";

interface CreatePaymentResponse {
  data: string;
}

class PaymentService {
  private readonly basePath = "/payments";

  async createPayment(orderId: string, method: "momo" | "vnpay") {
    const response = await api.post<CreatePaymentResponse>(
      `${this.basePath}/create-payment`,
      {
        orderId,
        payment_method: method,
      }
    );

    return response;
  }
}

export default new PaymentService();

// createPayment: async (orderId: string, method: "momo" | "vnpay") => {
//     const response = await api.post<CreatePaymentResponse>(
//       `${this.basePath}/create-payment`,
//       {
//         orderId,
//         payment_method: method,
//       }
//     );
//     return response;
//   },

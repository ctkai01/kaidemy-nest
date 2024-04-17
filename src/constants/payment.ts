import { Course } from "src/entities";

export const FEE_PLATFORM = 10

export interface CartItem {
  cartID: number;
  course: Course;
}

export interface CartResponse {
  userID: number;
  cartItems: CartItem[]
}
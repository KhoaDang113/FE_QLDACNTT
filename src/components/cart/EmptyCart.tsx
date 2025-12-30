"use client"

import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { CategoryNav } from "@/components/category/CategoryNav" // Thêm import

interface EmptyCartProps {
  onContinueShopping: () => void
}

export default function EmptyCart({ onContinueShopping }: EmptyCartProps) {
  return (
    <div className="min-h bg-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
          <Link to="/" className="mr-4 hover:bg-gray-100 p-2 rounded-full transition-colors">
            <ChevronLeft className="w-3 h-3" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            Giỏ Hàng Của Bạn
          </h1>
        </div>
      </div>

      {/* Empty Cart Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 pb-0">
        <div className="flex flex-col items-center justify-center">
          {/* Shopping Basket SVG */}
          <div className="mb-8">
            <svg
              width="280"
              height="200"
              viewBox="0 0 280 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-lg"
            >
              {/* Basket handle */}
              <path
                d="M60 40 Q70 20, 90 15 L190 15 Q210 20, 220 40"
                stroke="#1e5631"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="90" cy="15" r="8" fill="#e879f9" />
              <circle cx="190" cy="15" r="8" fill="#e879f9" />

              {/* Basket body */}
              <path d="M50 60 L70 180 Q140 200, 210 180 L230 60 Z" fill="#22c55e" stroke="#16a34a" strokeWidth="2" />

              {/* Basket rim */}
              <ellipse cx="140" cy="60" rx="90" ry="15" fill="#1e5631" />

              {/* Basket slots */}
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <g key={i}>
                  <rect x={65 + i * 22} y="75" width="12" height="35" rx="6" fill="white" opacity="0.9" />
                  <rect x={68 + i * 22} y="120" width="12" height="35" rx="6" fill="white" opacity="0.9" />
                </g>
              ))}
            </svg>
          </div>

          {/* Continue Shopping Button */}
          <Button
            onClick={onContinueShopping}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-base font-medium rounded-lg mb-4"
          >
            Tiếp tục mua hàng
          </Button>

          <p className="text-gray-600 mb-8">
            Giỏ hàng của bạn đang trống. Hãy thêm sản phẩm để bắt đầu mua sắm!
          </p>
        </div>

        {/* Thay thế phần categories cũ bằng CategoryNav */}
        <div className="w-full bg-white rounded-lg overflow-hidden">
          <CategoryNav />
        </div>
      </div>
    </div>
  )
}

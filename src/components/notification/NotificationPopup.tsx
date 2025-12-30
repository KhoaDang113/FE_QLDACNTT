"use client"

import { useNotification } from "@/hooks/useNotification"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"
import type { ReactNode } from "react"

export function NotificationPopup() {
  const { notifications, removeNotification } = useNotification()

  const getIcon = (type: string) => {
    const iconClass = "w-5 h-5"
    switch (type) {
      case "success":
        return <CheckCircle className={`${iconClass} text-green-600`} />
      case "error":
        return <AlertCircle className={`${iconClass} text-red-600`} />
      case "warning":
        return <AlertTriangle className={`${iconClass} text-yellow-600`} />
      case "info":
        return <Info className={`${iconClass} text-blue-600`} />
      default:
        return <Info className={`${iconClass} text-blue-600`} />
    }
  }

  const getStyles = (type: string) => {
    switch (type) {
      case "success":
        return {
          bg: "bg-gradient-to-r from-green-50 to-emerald-50",
          border: "border-l-4 border-green-500",
          iconBg: "bg-green-100",
          title: "text-green-900",
          message: "text-green-700",
        }
      case "error":
        return {
          bg: "bg-gradient-to-r from-red-50 to-rose-50",
          border: "border-l-4 border-red-500",
          iconBg: "bg-red-100",
          title: "text-red-900",
          message: "text-red-700",
        }
      case "warning":
        return {
          bg: "bg-gradient-to-r from-yellow-50 to-amber-50",
          border: "border-l-4 border-yellow-500",
          iconBg: "bg-yellow-100",
          title: "text-yellow-900",
          message: "text-yellow-700",
        }
      case "info":
        return {
          bg: "bg-gradient-to-r from-blue-50 to-cyan-50",
          border: "border-l-4 border-blue-500",
          iconBg: "bg-blue-100",
          title: "text-blue-900",
          message: "text-blue-700",
        }
      default:
        return {
          bg: "bg-gradient-to-r from-blue-50 to-cyan-50",
          border: "border-l-4 border-blue-500",
          iconBg: "bg-blue-100",
          title: "text-blue-900",
          message: "text-blue-700",
        }
    }
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
          getIcon={getIcon}
          getStyles={getStyles}
        />
      ))}
    </div>
  )
}

interface NotificationItemProps {
  notification: {
    id: string
    type: string
    title: string
    message?: string
  }
  onClose: () => void
  getIcon: (type: string) => ReactNode
  getStyles: (type: string) => {
    bg: string
    border: string
    iconBg: string
    title: string
    message: string
  }
}

function NotificationItem({
  notification,
  onClose,
  getIcon,
  getStyles,
}: NotificationItemProps) {
  const styles = getStyles(notification.type)

  return (
    <div
      id={`notification-${notification.id}`}
      className={`
        ${styles.bg}
        ${styles.border}
        rounded-lg shadow-xl p-4
        transform transition-all duration-300 ease-in-out
        animate-slide-in-right
        pointer-events-auto
        backdrop-blur-sm
        border-t border-r border-b border-gray-200/50
      `}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Icon với background đẹp */}
        <div className={`flex-shrink-0 ${styles.iconBg} rounded-full p-2`}>
          {getIcon(notification.type)}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-bold text-base ${styles.title} leading-tight`}>
            {notification.title}
          </h4>
          {notification.message && (
            <p className={`mt-1.5 text-sm ${styles.message} leading-relaxed`}>
              {notification.message}
            </p>
          )}
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`
            flex-shrink-0 ml-2 p-1.5 rounded-lg
            ${styles.title} 
            hover:bg-black/10 active:bg-black/20
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
            focus:ring-opacity-50
          `}
          aria-label="Đóng thông báo"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

import { useState, useEffect } from "react";
import { X, Plus, Edit2, Trash2, MapPin } from "lucide-react";
import { addressService } from "@/api";
import type { Address } from "@/api/types";
import { AddressFormModal } from "./AddressFormModal";
import { ConfirmationModal } from "./ConfirmationModal";

interface AddressListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress?: (address: Address) => void;
  showSelection?: boolean; // For checkout flow
}

export function AddressListModal({
  isOpen,
  onClose,
  onSelectAddress,
  showSelection = false,
}: AddressListModalProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [error, setError] = useState<string>("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      loadAddresses();
    }
  }, [isOpen]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await addressService.getAddresses();
      setAddresses(response.addresses || []);
      
      // Auto select default address
      const defaultAddr = response.addresses?.find((addr) => addr.is_default);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr);
      }
    } catch (err) {
      console.error("Error loading addresses:", err);
      setError("Không thể tải danh sách địa chỉ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (address: Address, e: React.MouseEvent) => {
    e.stopPropagation();
    setAddressToDelete(address);
    setError(""); // Clear any previous errors
    setSuccessMessage(""); // Clear any previous success messages
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!addressToDelete) return;

    try {
      setDeleting(true);
      await addressService.deleteAddress(addressToDelete._id);
      await loadAddresses();
      
      // Show success message
      setSuccessMessage("Đã xóa địa chỉ thành công!");
      setDeleteConfirmOpen(false);
      setAddressToDelete(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.error("Error deleting address:", err);
      setError("Không thể xóa địa chỉ. Vui lòng thử lại.");
      setDeleteConfirmOpen(false);
      setAddressToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    if (!deleting) {
      setDeleteConfirmOpen(false);
      setAddressToDelete(null);
    }
  };

  const handleEdit = (address: Address, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAddress(address);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingAddress(null);
  };

  const handleFormSave = async () => {
    setIsFormOpen(false);
    setEditingAddress(null);
    await loadAddresses();
  };

  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address);
    if (onSelectAddress) {
      onSelectAddress(address);
    }
    // Nếu không phải selection mode, tự động đóng modal sau khi chọn
    if (!showSelection) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (selectedAddress && onSelectAddress) {
      onSelectAddress(selectedAddress);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0 bg-gradient-to-r from-green-50 to-green-100">
            <h2 className="text-xl font-semibold text-gray-800">
              Thông tin nhận hàng
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors rounded-full p-1 hover:bg-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="overflow-y-auto px-6 py-4 flex-1">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
                {successMessage}
              </div>
            )}

            {loading && addresses.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Đang tải địa chỉ...</p>
                </div>
              </div>
            ) : addresses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <MapPin className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-6">
                  Bạn chưa có địa chỉ nhận hàng nào
                </p>
                <button
                  onClick={handleAddNew}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Thêm địa chỉ mới
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Address List */}
                {addresses.map((address) => (
                  <div
                    key={address._id}
                    onClick={() => handleSelectAddress(address)}
                    className={`relative border-2 rounded-lg p-4 transition-all cursor-pointer ${
                      selectedAddress?._id === address._id
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                    }`}
                  >
                    {/* Radio button for selection */}
                    {showSelection && (
                      <div className="absolute top-4 left-4">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            selectedAddress?._id === address._id
                              ? "border-green-600 bg-green-600"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedAddress?._id === address._id && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Address Content */}
                    <div className={showSelection ? "ml-8" : ""}>
                      {/* Recipient Info */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-800">
                            {address.full_name}
                          </h3>
                          <span className="text-gray-600">|</span>
                          <span className="text-gray-600">{address.phone}</span>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleEdit(address, e)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(address, e)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                            disabled={loading || deleting}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Full Address */}
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {addressService.formatFullAddress(address)}
                      </p>

                      {/* Default Badge */}
                      {address.is_default && (
                        <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          Mặc định
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add New Address Button */}
                <button
                  onClick={handleAddNew}
                  className="w-full border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 rounded-lg p-4 flex items-center justify-center gap-2 text-green-600 font-medium transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Thêm thông tin nhận hàng
                </button>
              </div>
            )}
          </div>

          {/* Footer - Confirm Button (only show if in selection mode and has addresses) */}
          {showSelection && addresses.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0 bg-gray-50">
              <button
                onClick={handleConfirm}
                disabled={!selectedAddress}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                XÁC NHẬN
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Address Form Modal */}
      <AddressFormModal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSave={handleFormSave}
        editingAddress={editingAddress}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Xóa địa chỉ"
        message={
          addressToDelete
            ? `Bạn có chắc chắn muốn xóa địa chỉ "${addressToDelete.full_name} - ${addressService.formatFullAddress(addressToDelete)}"?\n\nHành động này không thể hoàn tác.`
            : "Bạn có chắc chắn muốn xóa địa chỉ này?"
        }
        confirmText="Xóa"
        cancelText="Hủy"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        loading={deleting}
      />
    </>
  );
}


import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DeleteConfirmModal({ isOpen, conversationTitle, onConfirm, onCancel }) {
  if (!isOpen) return null

  return (
    <>
      {/* Modal Overlay */}
      <div
        className="modal-backdrop p-4"
        onClick={onCancel}
      >
        {/* Modal Content */}
        <div
          className="modal-content p-5 sm:p-6 md:p-6 w-full max-w-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex-shrink-0 mt-0.5">
              <Trash2 className="w-5 sm:w-6 h-5 sm:h-6 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                                Are you sure you want to delete?
              </h2>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 mt-5 sm:mt-6 sm:justify-end">
            <Button
              onClick={onCancel}
              className="px-3 sm:px-4 py-2 text-gray-900 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors h-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="px-3 sm:px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors h-auto"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

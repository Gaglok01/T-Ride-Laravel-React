import { forwardRef } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"

interface CustomDatePickerProps {
    label: string
    value: string
    onChange: (value: string) => void
    required?: boolean
    placeholder?: string
    minDate?: Date
}

export function ModalDatePicker({
    label,
    value,
    onChange,
    required = false,
    placeholder = "Select date",
    minDate
}: CustomDatePickerProps) {
    const selectedDate = value ? new Date(value) : null

    const handleChange = (date: Date | null) => {
        if (date) {
            // Format as YYYY-MM-DD for backend compatibility
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            onChange(`${year}-${month}-${day}`)
        } else {
            onChange("")
        }
    }

    // Custom input component for the datepicker
    const CustomInput = forwardRef<HTMLButtonElement, { value?: string; onClick?: () => void }>(
        ({ value, onClick }, ref) => (
            <button
                type="button"
                onClick={onClick}
                ref={ref}
                className="w-full bg-tride-card border border-tride-border rounded-xl text-tride-text focus:outline-none focus:border-tride-yellow focus:ring-1 focus:ring-tride-yellow transition-all placeholder-tride-text-muted pl-11 pr-4 py-3 text-left flex items-center"
            >
                <span className={value ? "text-tride-text" : "text-tride-text-muted"}>
                    {value || placeholder}
                </span>
            </button>
        )
    )
    CustomInput.displayName = "CustomInput"

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-tride-text">
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <div className="relative custom-datepicker">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-tride-text-muted pointer-events-none z-10">
                    <Calendar size={16} />
                </div>
                <DatePicker
                    selected={selectedDate}
                    onChange={handleChange}
                    dateFormat="dd MMM yyyy"
                    minDate={minDate}
                    customInput={<CustomInput />}
                    calendarClassName="custom-calendar"
                    popperClassName="custom-datepicker-popper"
                    wrapperClassName="w-full"
                    showPopperArrow={false}
                    portalId="datepicker-portal"
                    popperPlacement="bottom-start"
                    renderCustomHeader={({
                        date,
                        decreaseMonth,
                        increaseMonth,
                        prevMonthButtonDisabled,
                        nextMonthButtonDisabled,
                    }) => (
                        <div className="flex items-center justify-between px-4 py-3 bg-tride-card border-b border-tride-border">
                            <button
                                onClick={decreaseMonth}
                                disabled={prevMonthButtonDisabled}
                                type="button"
                                className="p-1.5 rounded-lg hover:bg-tride-hover text-tride-text-muted hover:text-tride-text transition-colors disabled:opacity-30"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <span className="text-tride-text font-semibold">
                                {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                            <button
                                onClick={increaseMonth}
                                disabled={nextMonthButtonDisabled}
                                type="button"
                                className="p-1.5 rounded-lg hover:bg-tride-hover text-tride-text-muted hover:text-tride-text transition-colors disabled:opacity-30"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                />
            </div>
        </div>
    )
}

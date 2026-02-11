import { useState, useRef, useEffect, useCallback } from "react"
import { MapPin, Search, Loader2 } from "lucide-react"
import { useGoogleMaps } from "@/providers/GoogleMapsProvider"

interface PlacesAutocompleteInputProps {
    label?: string
    value: string
    onChange: (value: string) => void
    onPlaceSelect?: (place: {
        address: string
        lat?: number
        lng?: number
        city?: string
        country?: string
    }) => void
    placeholder?: string
    required?: boolean
    disabled?: boolean
    icon?: React.ReactNode
    types?: string[] // e.g. ['(cities)'], ['address'], ['geocode']
    componentRestrictions?: { country: string | string[] }
    className?: string
}

export function PlacesAutocompleteInput({
    label,
    value,
    onChange,
    onPlaceSelect,
    placeholder = "Search for a place...",
    required = false,
    disabled = false,
    icon,
    types,
    componentRestrictions,
    className = "",
}: PlacesAutocompleteInputProps) {
    const { isLoaded } = useGoogleMaps()
    const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)
    const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null)
    const placesService = useRef<google.maps.places.PlacesService | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const dummyDiv = useRef<HTMLDivElement>(null)

    // Initialize services when google maps is loaded
    useEffect(() => {
        if (isLoaded && window.google) {
            autocompleteService.current = new google.maps.places.AutocompleteService()
            // PlacesService needs a DOM element or map
            if (dummyDiv.current) {
                placesService.current = new google.maps.places.PlacesService(dummyDiv.current)
            }
        }
    }, [isLoaded])

    // Close suggestions on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowSuggestions(false)
                setActiveIndex(-1)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const fetchSuggestions = useCallback(
        (input: string) => {
            if (!autocompleteService.current || !input.trim()) {
                setSuggestions([])
                setShowSuggestions(false)
                return
            }

            setIsSearching(true)

            const request: google.maps.places.AutocompletionRequest = {
                input,
                ...(types && { types }),
                ...(componentRestrictions && { componentRestrictions }),
            }

            autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
                setIsSearching(false)
                if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                    setSuggestions(predictions)
                    setShowSuggestions(true)
                } else {
                    console.error("Places API Error or No Results:", status)
                    setSuggestions([])
                    setShowSuggestions(false)
                }
            })
        },
        [types, componentRestrictions]
    )

    // Debounce input
    const debounceTimer = useRef<NodeJS.Timeout | null>(null)

    const handleInputChange = (newValue: string) => {
        onChange(newValue)
        setActiveIndex(-1)

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current)
        }

        debounceTimer.current = setTimeout(() => {
            fetchSuggestions(newValue)
        }, 300)
    }

    const handleSelectSuggestion = (prediction: google.maps.places.AutocompletePrediction) => {
        const selectedAddress = prediction.description
        onChange(selectedAddress)
        setShowSuggestions(false)
        setSuggestions([])
        setActiveIndex(-1)

        // Get place details for lat/lng
        if (placesService.current && onPlaceSelect) {
            placesService.current.getDetails(
                {
                    placeId: prediction.place_id,
                    fields: ["formatted_address", "geometry", "address_components"],
                },
                (place, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                        let city = ""
                        let country = ""

                        place.address_components?.forEach((component) => {
                            if (component.types.includes("locality")) {
                                city = component.long_name
                            }
                            if (component.types.includes("country")) {
                                country = component.long_name
                            }
                        })

                        onPlaceSelect({
                            address: place.formatted_address || selectedAddress,
                            lat: place.geometry?.location?.lat(),
                            lng: place.geometry?.location?.lng(),
                            city,
                            country,
                        })
                    } else {
                        onPlaceSelect({ address: selectedAddress })
                    }
                }
            )
        } else if (onPlaceSelect) {
            onPlaceSelect({ address: selectedAddress })
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions || suggestions.length === 0) return

        if (e.key === "ArrowDown") {
            e.preventDefault()
            setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
        } else if (e.key === "Enter") {
            e.preventDefault()
            if (activeIndex >= 0 && activeIndex < suggestions.length) {
                handleSelectSuggestion(suggestions[activeIndex])
            }
        } else if (e.key === "Escape") {
            setShowSuggestions(false)
            setActiveIndex(-1)
        }
    }

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Hidden div for PlacesService */}
            <div ref={dummyDiv} style={{ display: "none" }} />

            {label && (
                <label className="block text-sm font-medium text-tride-text mb-1.5 ml-1">
                    {label}
                    {required && <span className="text-red-400 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                {/* Icon */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-tride-text-muted pointer-events-none z-10">
                    {icon || <MapPin size={16} />}
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={() => {
                        if (suggestions.length > 0) setShowSuggestions(true)
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={isLoaded ? placeholder : "Loading maps..."}
                    disabled={disabled || !isLoaded}
                    required={required}
                    className={`w-full bg-tride-card border border-tride-border rounded-xl pl-11 pr-10 py-3 text-tride-text
                        focus:outline-none focus:border-tride-yellow focus:ring-1 focus:ring-tride-yellow
                        transition-all placeholder-tride-text-muted
                        ${disabled || !isLoaded ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                    autoComplete="off"
                />

                {/* Loading/Search indicator */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-tride-text-muted">
                    {isSearching ? (
                        <Loader2 size={16} className="animate-spin text-tride-yellow" />
                    ) : (
                        <Search size={16} />
                    )}
                </div>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1.5 bg-tride-card border border-tride-border rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto">
                    {suggestions.map((prediction, index) => {
                        const mainText = prediction.structured_formatting.main_text
                        const secondaryText = prediction.structured_formatting.secondary_text

                        return (
                            <button
                                key={prediction.place_id}
                                type="button"
                                onClick={() => handleSelectSuggestion(prediction)}
                                onMouseEnter={() => setActiveIndex(index)}
                                className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors border-b border-tride-border/50 last:border-b-0
                                    ${
                                        activeIndex === index
                                            ? "bg-tride-yellow/10"
                                            : "hover:bg-tride-hover"
                                    }
                                `}
                            >
                                <MapPin
                                    size={16}
                                    className={`mt-0.5 flex-shrink-0 ${
                                        activeIndex === index
                                            ? "text-tride-yellow"
                                            : "text-tride-text-muted"
                                    }`}
                                />
                                <div className="flex-1 min-w-0">
                                    <p
                                        className={`text-sm font-medium truncate ${
                                            activeIndex === index
                                                ? "text-tride-yellow"
                                                : "text-tride-text"
                                        }`}
                                    >
                                        {mainText}
                                    </p>
                                    {secondaryText && (
                                        <p className="text-xs text-tride-text-muted truncate mt-0.5">
                                            {secondaryText}
                                        </p>
                                    )}
                                </div>
                            </button>
                        )
                    })}

                    {/* Google attribution */}
                    <div className="px-4 py-2 bg-tride-hover/50 flex items-center justify-end">
                        <span className="text-[10px] text-tride-text-muted">Powered by Google</span>
                    </div>
                </div>
            )}
        </div>
    )
}

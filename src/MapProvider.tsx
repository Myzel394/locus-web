import {Component, createContext, createSignal, JSX, useContext} from "solid-js"
import * as L from "leaflet"
import {LocationPoint} from "./effects/use-location-points"

export interface MapProviderContextData {
	goToPosition: (latitude: number, longitude: number, animate: boolean) => void
	setLocationPoint: (point: LocationPoint) => void
	locationPoint: () => LocationPoint
	_setMap: (map: L.Map) => void
	map: () => L.Map | undefined
}

const MapProviderContext = createContext<MapProviderContextData>()

const MapProvider: Component = (props: {children: JSX.Element}): JSX.Element => {
	let currentCircle: L.Circle | undefined
	const [locationPoint, _setLocationPoint] = createSignal<LocationPoint | undefined>(undefined)

	const [map, setMap] = createSignal<L.Map>()

	return (
		<MapProviderContext.Provider
			value={{
				goToPosition: (latitude: number, longitude: number, animate = true) => {
					map()?.setView?.([latitude, longitude], 16, {
						animate,
						duration: 1,
					})
				},
				setLocationPoint: (point: LocationPoint) => {
					_setLocationPoint(point)

					if (currentCircle) {
						currentCircle.remove()
					}

					const currentMap = map()

					if (currentMap) {
						currentCircle = L.circle([point.latitude, point.longitude], {
							radius: point.accuracy,
							color: "#3454C5",
							fillOpacity: 0.2,
						}).addTo(currentMap)
					}
				},
				locationPoint: () => locationPoint()!,
				_setMap: setMap,
				map: map,
			}}
		>
			{props.children}
		</MapProviderContext.Provider>
	)
}

export default MapProvider

export const useMap = () => {
	return useContext(MapProviderContext)
}

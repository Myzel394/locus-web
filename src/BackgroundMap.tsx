import * as L from "leaflet"
import {Component, createEffect, JSX, onCleanup, onMount} from "solid-js"
import "leaflet-rotate"
import {useMap} from "./MapProvider"
import {ACCESS_TOKEN} from "./constants"

const BackgroundMap: Component = (): JSX.Element => {
	const {map, locationPoint, backgroundMap, _setBackgroundMap} = useMap()

	onMount(() => {
		_setBackgroundMap(
			L.map("background-location-map", {
				rotate: true,
				zoomControl: false,
				attributionControl: false,
			}).setView(
				[locationPoint()!.latitude as number, locationPoint()!.longitude as number],
				16,
			),
		)

		L.tileLayer(
			`https://tile.jawg.io/6f677dd5-098d-4198-849b-adcb87377fc8/{z}/{x}/{y}{r}.png?access-token=${ACCESS_TOKEN}`,
			{},
		).addTo(backgroundMap())
	})

	createEffect(() => {
		const currentMap: L.Map = map()

		if (currentMap) {
			currentMap.addEventListener({
				drag: () => {
					backgroundMap().setView(currentMap.getCenter(), currentMap.getZoom(), {
						animate: false,
					})
				},
				zoom: () => {
					backgroundMap().setView(currentMap.getCenter(), currentMap.getZoom(), {
						animate: false,
					})
				},
			})
		}
	})

	onCleanup(() => {})

	return (
		<div
			id="background-location-map"
			class="absolute top-0 left-0 w-full h-full z-0 opacity-5 pointer-events-none saturate-200"
		/>
	)
}

export default BackgroundMap

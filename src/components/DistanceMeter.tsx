import {Component, JSX, createResource, Show} from "solid-js"
import haversine from "haversine"
import Text from "./Text"
import {useMap} from "./MapProvider"

const DistanceMeter: Component = (): JSX.Element => {
	const {locationPoint} = useMap()
	const [position] = createResource(
		() =>
			new Promise((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(resolve, reject)
			}),
	)

	return (
		<Show when={position()}>
			<Text variant="caption">
				You are{" "}
				{haversine(
					{
						latitude: position().coords.latitude,
						longitude: position().coords.longitude,
					},
					{
						longitude: locationPoint().longitude,
						latitude: locationPoint().latitude,
					},
					{
						unit: "meter",
					} as haversine.Options,
				).toFixed()}{" "}
				meters away from this location.
			</Text>
		</Show>
	)
}

export default DistanceMeter

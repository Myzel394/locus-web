import {Component, JSX} from "solid-js"
import {useMap} from "./MapProvider"
import Text from "./Text"

const BatteryStatus: Component = (): JSX.Element => {
	const {locationPoint} = useMap()

	// We round up so that the battery level is never at 0%.
	return (
		<Text variant="caption">
			Battery is at {Math.ceil(locationPoint().batteryLevel * 100)}%.
		</Text>
	)
}

export default BatteryStatus

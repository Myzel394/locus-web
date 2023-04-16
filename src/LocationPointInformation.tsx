import {LocationPoint} from "./effects/use-location-points"
import {Component, JSX} from "solid-js"
import {format} from "date-fns"
import {useMap} from "./MapProvider"
import Text from "./Text"
import {FaSolidCircle, FaSolidClock} from "solid-icons/fa"

export interface LocationPointInformationProps {
	point: LocationPoint
}

const LocationPointInformation: Component<LocationPointInformationProps> = (
	props: LocationPointInformationProps,
): JSX.Element => {
	const {goToPosition, setLocationPoint} = useMap()

	console.log(props.point)

	return (
		<button
			class="hover:bg-white hover:bg-opacity-10 rounded-xl duration-50 px-5 py-2"
			onclick={() => {
				setLocationPoint(props.point)
				goToPosition(props.point.latitude, props.point.longitude, true)
			}}
		>
			<Text variant="heading-2">
				{props.point.latitude}, {props.point.longitude}
			</Text>
			<div class="flex flex-row gap-x-2">
				<div class="flex flex-row gap-x-1 items-center">
					<div class="text-white">
						<FaSolidClock class="text-xs" />
					</div>
					<Text variant="information">{format(props.point.createdAt, "Pp")}</Text>
				</div>
				<div class="flex flex-row gap-x-1 items-center">
					<div class="text-white">
						<FaSolidCircle class="text-xs text-white" />
					</div>
					<Text variant="information">{props.point.accuracy.toFixed(0)}</Text>
				</div>
			</div>
		</button>
	)
}

export default LocationPointInformation

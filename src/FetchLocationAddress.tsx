import {Component, createResource, JSX} from "solid-js"
import Text from "./Text"

export interface HFetchLocationAddressProps {
	longitude: number
	latitude: number
}

const FetchLocationAddress: Component<HFetchLocationAddressProps> = (
	props: HFetchLocationAddressProps,
): JSX.Element => {
	const [address] = createResource(
		async () => {
			const response = await fetch(
				`https://geocode.maps.co/reverse?lat=${props.latitude}&lon=${props.longitude}`,
			)

			const data = await response.json()

			return data.display_name
		},
		{
			initialValue: `${props.latitude}, ${props.longitude}`,
		},
	)

	return <Text variant="body">{address()}</Text>
}

export default FetchLocationAddress

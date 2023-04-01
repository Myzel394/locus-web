import {Component, createResource, JSX} from "solid-js"
import Text from "./Text"

export interface RelayStatusProps {
	url: string
}

const RelayStatus: Component<RelayStatusProps> = (props: RelayStatusProps): JSX.Element => {
	const [isOnline] = createResource(() => async () => {
		const response = await fetch(props.url)
		return response.status === 200
	})

	return (
		<div class="flex flex-row items-center">
			<div class="basis-1/12">
				<div
					class="w-3 h-3 rounded-full"
					style={{
						background: isOnline() ? "green" : "red",
					}}
				/>
			</div>
			<div class="basis-11/12">
				<Text variant="body">{props.url}</Text>
			</div>
		</div>
	)
}

export default RelayStatus

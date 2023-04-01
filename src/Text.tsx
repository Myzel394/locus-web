import {Component, JSX} from "solid-js"

export interface TextProps {
	variant: "title" | "heading-1" | "heading-2" | "body" | "caption"
	children: JSX.Element
}

const VARIANT_CLASS_MAP: Record<TextProps["variant"], string> = {
	title: "text-6xl font-black text-white tracking-widest leading-normal",
	"heading-1": "text-3xl font-black text-white leading-relaxed",
	"heading-2": "text-2xl font-bold text-white leading-relaxed",
	body: "text-base font-normal text-white leading-loose",
	caption: "text-lg font-light text-white leading-loose",
}

const Text: Component<TextProps> = ({variant, children}: TextProps): JSX.Element => {
	switch (variant) {
		case "title":
			return <h1 class={VARIANT_CLASS_MAP[variant]}>{children}</h1>
		case "heading-1":
			return <h2 class={VARIANT_CLASS_MAP[variant]}>{children}</h2>
		case "heading-2":
			return <h3 class={VARIANT_CLASS_MAP[variant]}>{children}</h3>
		case "body":
			return <p class={VARIANT_CLASS_MAP[variant]}>{children}</p>
		case "caption":
			return <p class={VARIANT_CLASS_MAP[variant]}>{children}</p>
	}
}

export default Text

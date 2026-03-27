const preloaderHtml = `<!--<div id="loader">-->
<!--	<div class="loading-text">-->
<!--		<span>S</span>-->
<!--		<span>V</span>-->
<!--		<span>L</span>-->
<!--	</div>-->
<!--</div>-->

<!--<style>-->
<!--	:root {-->
<!--		--color-red: red;-->
<!--		--color-orange: orange;-->
<!--		--color-yellow: yellow;-->
<!--		--color-green: green;-->
<!--		--color-blue: blue;-->
<!--		--color-indigo: indigo;-->
<!--		--color-violet: violet;-->
<!--	}-->


<!--	#loader {-->
<!--		position: fixed;-->
<!--		top: 0;-->
<!--		left: 0;-->
<!--		width: 100vw;-->
<!--		height: 100vh;-->
<!--		background: radial-gradient(circle at center, #1a1a1a 0%, #000 100%);-->
<!--		display: flex;-->
<!--		align-items: center;-->
<!--		justify-content: center;-->
<!--		z-index: 9999;-->
<!--	}-->

<!--	.loading-text {-->
<!--		font-size: 3rem;-->
<!--		font-weight: 700;-->
<!--		display: flex;-->
<!--		gap: 0.15em;-->
<!--	}-->

<!--	.loading-text span {-->
<!--		animation: rainbowColor 2.5s linear infinite, bounce 1.5s ease-in-out infinite;-->
<!--		animation-delay: calc(var(--i) * 0.15s);-->
<!--		display: inline-block;-->
<!--	}-->

<!--	.loading-text span:nth-child(1) {-->
<!--		--i: 1;-->
<!--	}-->

<!--	.loading-text span:nth-child(2) {-->
<!--		--i: 2;-->
<!--	}-->

<!--	.loading-text span:nth-child(3) {-->
<!--		--i: 3;-->
<!--	}-->

<!--	.loading-text span:nth-child(4) {-->
<!--		--i: 4;-->
<!--	}-->

<!--	.loading-text span:nth-child(5) {-->
<!--		--i: 5;-->
<!--	}-->

<!--	.loading-text span:nth-child(6) {-->
<!--		--i: 6;-->
<!--	}-->

<!--	.loading-text span:nth-child(7) {-->
<!--		--i: 7;-->
<!--	}-->

<!--	@keyframes rainbowColor {-->
<!--		0% {-->
<!--			color: var(--color-red);-->
<!--		}-->

<!--		14% {-->
<!--			color: var(--color-orange);-->
<!--		}-->

<!--		28% {-->
<!--			color: var(--color-yellow);-->
<!--		}-->

<!--		42% {-->
<!--			color: var(--color-green);-->
<!--		}-->

<!--		57% {-->
<!--			color: var(--color-blue);-->
<!--		}-->

<!--		71% {-->
<!--			color: var(--color-indigo);-->
<!--		}-->

<!--		85% {-->
<!--			color: var(--color-violet);-->
<!--		}-->

<!--		100% {-->
<!--			color: var(--color-red);-->
<!--		}-->
<!--	}-->

<!--	@keyframes bounce {-->

<!--		0%,-->
<!--		100% {-->
<!--			transform: translateY(0);-->
<!--		}-->

<!--		50% {-->
<!--			transform: translateY(-10px);-->
<!--		}-->
<!--	}-->

<!--	body {-->
<!--		margin: 0;-->
<!--		background: #000;-->
<!--		font-family: 'Montserrat', sans-serif;-->
<!--	}-->
<!--</style>-->`;

export default function Preloader() {
  return <div dangerouslySetInnerHTML={{ __html: preloaderHtml }} />;
}

/**
 * External dependencies
 */
import { WP_REST_API_Category } from 'wp-types';
import { ProductResponseItem } from '@woocommerce/types';
import {
	getImageSrcFromProduct,
	getImageIdFromProduct,
} from '@woocommerce/utils';
import { useEffect, useState } from '@wordpress/element';
import type { Dispatch, SetStateAction } from 'react';

/**
 * Internal dependencies
 */
import { BLOCK_NAMES } from './constants';
import {
	getCategoryImageSrc,
	getCategoryImageId,
} from './featured-category/utils';

interface BackgroundProps {
	blockName: string;
	item: ProductResponseItem | WP_REST_API_Category;
	mediaId: number | undefined;
	mediaSrc: string | undefined;
	blockAttributes: { isRepeated: boolean; imageFit: string };
}

interface BgImageDimensions {
	height: number;
	width: number;
}

interface BackgroundImage {
	backgroundImageId: number;
	backgroundImageSrc: string;
	backgroundColorVisibility: boolean;
	setFeaturedProductParentDivDimensions: Dispatch<
		SetStateAction< BgImageDimensions >
	>;
}

export function useBackgroundImage( {
	blockName,
	item,
	mediaId,
	mediaSrc,
	blockAttributes,
}: BackgroundProps ): BackgroundImage {
	const [ backgroundImageId, setBackgroundImageId ] = useState( 0 );
	const [ backgroundImageSrc, setBackgroundImageSrc ] = useState( '' );
	const [ backgroundColorVisibility, setBackgroundColorVisibility ] =
		useState( false );
	const [
		featuredProductParentDivDimensions,
		setFeaturedProductParentDivDimensions,
	] = useState< BgImageDimensions >( { height: 0, width: 0 } );
	const [ isImageBgTransparent, setIsImageBgTransparent ] = useState( false );
	const [ originalImgDimension, setOriginalImgDimension ] =
		useState< BgImageDimensions >( { height: 0, width: 0 } );

	useEffect( () => {
		if ( mediaId ) {
			setBackgroundImageId( mediaId );
		} else {
			setBackgroundImageId(
				blockName === BLOCK_NAMES.featuredProduct
					? getImageIdFromProduct( item as ProductResponseItem )
					: getCategoryImageId( item as WP_REST_API_Category )
			);
		}
	}, [ blockName, item, mediaId ] );

	useEffect( () => {
		if ( mediaSrc ) {
			setBackgroundImageSrc( mediaSrc );
		} else {
			setBackgroundImageSrc(
				blockName === BLOCK_NAMES.featuredProduct
					? getImageSrcFromProduct( item as ProductResponseItem )
					: getCategoryImageSrc( item as WP_REST_API_Category )
			);
		}
	}, [ blockName, item, mediaSrc ] );

	useEffect( () => {
		if ( backgroundImageSrc ) {
			const img = new Image();
			img.src = backgroundImageSrc;

			img.onload = () => {
				const width = img.naturalWidth;
				const height = img.naturalHeight;

				if ( height !== null && width !== null ) {
					setOriginalImgDimension( {
						height,
						width,
					} );
				}

				// Create a canvas element.
				const canvas = document.createElement( 'canvas' );
				canvas.width = width;
				canvas.height = height;

				// Draw the image on the canvas element.
				const ctx = canvas.getContext( '2d' );
				if ( ! ctx ) return;

				ctx.drawImage( img, 0, 0, width, height );

				const imageData = ctx.getImageData( 0, 0, width, height ).data;

				// Check for any transparent pixels.
				for ( let i = 3; i < imageData.length; i += 4 ) {
					if ( imageData[ i ] < 255 ) {
						setIsImageBgTransparent( true );
						break;
					}
				}
			};
		}
	}, [ backgroundImageSrc ] );

	useEffect( () => {
		if ( isImageBgTransparent ) {
			setBackgroundColorVisibility( true );
		}

		// Checks if original-bg-image is smaller than the parent div's available space.
		if (
			originalImgDimension.height <
				featuredProductParentDivDimensions.height ||
			originalImgDimension.width <
				featuredProductParentDivDimensions.width
		) {
			setBackgroundColorVisibility( true );
		}

		// Checks if bg-image is not transparent and original-bg-image size is bigger than parent div's available space.
		if (
			! isImageBgTransparent &&
			originalImgDimension.height >=
				featuredProductParentDivDimensions.height &&
			originalImgDimension.width >=
				featuredProductParentDivDimensions.width
		) {
			setBackgroundColorVisibility( false );
		}

		// Checks if bg-image is not transparent and repeated all-over parent div or covers available parent div space.
		if (
			! isImageBgTransparent &&
			( blockAttributes?.isRepeated ||
				blockAttributes?.imageFit === 'cover' )
		) {
			setBackgroundColorVisibility( false );
		}
	}, [
		featuredProductParentDivDimensions,
		isImageBgTransparent,
		blockAttributes,
		originalImgDimension,
	] );

	return {
		backgroundImageId,
		backgroundImageSrc,
		backgroundColorVisibility,
		setFeaturedProductParentDivDimensions,
	};
}

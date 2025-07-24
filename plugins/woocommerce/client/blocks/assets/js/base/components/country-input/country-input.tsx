/**
 * External dependencies
 */
import { useMemo } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import clsx from 'clsx';
import { COUNTRIES } from '@woocommerce/block-settings';

/**
 * Internal dependencies
 */
import './style.scss';
import type { CountryInputWithCountriesProps } from './CountryInputProps';
import { Select, SelectOption } from '../select';

export const CountryInput = ( {
	className,
	countries,
	id,
	errorId,
	label,
	onChange,
	value = '',
	autoComplete = 'off',
	required = false,
}: CountryInputWithCountriesProps ): JSX.Element => {
	const options = useMemo< SelectOption[] >( () => {
		return Object.entries( countries ).map(
			( [ countryCode, countryName ] ) => ( {
				value: countryCode,
				label: decodeEntities( countryName ),
			} )
		);
	}, [ countries ] );

	const getDefaultCountryValue = ( defaultCountry: string ) => {
		if ( COUNTRIES[ defaultCountry ] ) {
			return defaultCountry;
		}
		return '';
	};

	return (
		<Select
			className={ clsx( className, 'wc-block-components-country-input' ) }
			id={ id }
			errorId={ errorId || '' }
			label={ label || '' }
			onChange={ onChange }
			options={ options }
			value={ getDefaultCountryValue( String( value ) ) }
			required={ required }
			autoComplete={ autoComplete }
		/>
	);
};

export default CountryInput;

import { Fragment, useEffect, useState } from 'react'
import Countries from './select-country-action'
import Image from 'next/image'

import './select-country.scss'
import { Country } from '@/store/auth'

export default function SelectCountry({ disabled, value }: { disabled: boolean; value: Country | undefined }) {
    const [countries, setCountries] = useState<Country[]>([])
    const [selected, setSelected] = useState<Country>(
        value || {
            name: 'United Kingdom',
            phone: '+44',
            flag: 'https://flagcdn.com/gb.svg',
        }
    )

    useEffect(() => {
        Countries().then((data) => {
            setCountries(data)
        })
    }, [])

    function handleSelected(country: Country) {
        setSelected(country)
    }

    return (
        <div className="select-country">
            <input type="hidden" name="country" value={JSON.stringify(selected)} disabled={disabled} />
            <button className="selected" type="button" disabled={disabled}>
                {selected ? (
                    <Fragment>
                        <Image src={selected.flag} alt={selected.name} width={25} height={17} />
                        <span>{selected.phone}</span>
                    </Fragment>
                ) : null}
            </button>
            {!disabled && (
                <div className="countries">
                    <div className="countries-container">
                        {countries
                            .filter((c) => c.phone !== '')
                            .map((country) => (
                                <button type="button" key={country.name} onClick={() => handleSelected(country)}>
                                    <Image src={country.flag} alt={country.name} width={25} height={17} />
                                    <span>{country.name}</span>
                                    <span>{country.phone}</span>
                                </button>
                            ))}
                    </div>
                </div>
            )}
        </div>
    )
}

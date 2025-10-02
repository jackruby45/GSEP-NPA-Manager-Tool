import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';
import { toNumberOrNull } from '../utils.ts';
import { STREETS_BY_TOWN } from '../data/options.ts';

export const InputField = ({ label, value, onInput, type = 'text', ...props }) => {
    const handleInput = (e) => {
        const val = type === 'number' ? toNumberOrNull(e.currentTarget.value) : e.currentTarget.value;
        onInput(val);
    };

    if (type === 'date') {
        return html`
            <div class="form-group">
                <label>${label}</label>
                <div class="date-input-wrapper">
                    <input type="date" value=${value ?? ''} onInput=${handleInput} ...${props} />
                    <svg class="date-input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                </div>
            </div>
        `;
    }

    return html`
        <div class="form-group">
            <label>${label}</label>
            <input type=${type} value=${value ?? ''} onInput=${handleInput} ...${props} />
        </div>
    `;
}

export const SelectField = ({ label, value, onChange, options, placeholder, ...props }) => {
    const handleChange = (e) => onChange(e.currentTarget.value);
    return html`
        <div class="form-group">
            <label>${label}</label>
            <select value=${value} onChange=${handleChange} ...${props}>
                ${placeholder && html`<option value="">${placeholder}</option>`}
                ${options.map(opt => typeof opt === 'object'
                    ? html`<option key=${opt.value} value=${opt.value}>${opt.label}</option>`
                    : html`<option key=${opt} value=${opt}>${opt}</option>`
                )}
            </select>
        </div>
    `;
}

export const TextareaField = ({ label, value, onInput, ...props }) => {
    const handleInput = (e) => onInput(e.currentTarget.value);
    return html`
        <div class="form-group">
            <label>${label}</label>
            <textarea value=${value} onInput=${handleInput} ...${props}></textarea>
        </div>
    `;
}

export const RadioGroup = ({ label, name, value, options, onChange }) => {
    return html`
        <div class="form-group">
            <label>${label}</label>
            <div class="radio-group">
                ${options.map(opt => html`
                    <label key=${opt.value} class="radio-label">
                        <input
                            type="radio"
                            name=${name}
                            value=${opt.value}
                            checked=${value === opt.value}
                            onChange=${() => onChange(opt.value)}
                        />
                        <span>${opt.label}</span>
                    </label>
                `)}
            </div>
        </div>
    `;
}

export const TownStreetInput = ({ label, value, onInput, townCity, id, placeholder = "Select a street...", projectStreetNames = [] }) => {
    const staticStreets = townCity ? (STREETS_BY_TOWN[townCity] || []) : [];
    
    // Combine static town streets with other manually entered streets from the project,
    // ensure uniqueness, and sort alphabetically.
    const combinedStreets = [...new Set([...staticStreets, ...projectStreetNames])].sort();

    const availableStreets = combinedStreets.length > 0 ? combinedStreets : null;
    const OTHER_VALUE = '---OTHER---';

    // Fallback for towns without a predefined street list AND no project streets yet
    if (!availableStreets) {
        return html`
            <div class="form-group">
                <label for=${id}>${label}</label>
                <input
                    id=${id}
                    type="text"
                    value=${value || ''}
                    onInput=${(e) => onInput(e.currentTarget.value)}
                    placeholder="Enter street name"
                />
            </div>
        `;
    }

    // Determine if the current value passed via props is a custom one
    const isCustomValue = value && !availableStreets.includes(value);

    // State to track if we should be in manual entry mode.
    // It's initialized based on the incoming prop, but after that,
    // it's controlled by user interaction within this component.
    const [isManualMode, setManualMode] = useState(isCustomValue);

    // This effect synchronizes the internal mode with external prop changes.
    useEffect(() => {
        // If we are currently in manual mode and the value is cleared,
        // it's likely because the user just selected "Other...".
        // We should stay in manual mode and not let this effect override it.
        if (isManualMode && !value) {
            return;
        }

        // Otherwise, sync the mode based on whether the value is a custom entry.
        const isCustom = value && !availableStreets.includes(value);
        setManualMode(isCustom);
    }, [value, townCity, projectStreetNames, isManualMode]);

    const handleSelectChange = (e) => {
        const selectedValue = e.currentTarget.value;
        if (selectedValue === OTHER_VALUE) {
            // User wants to enter a custom value.
            setManualMode(true);
            // We clear the value in the parent state, so the user sees an empty input to type in.
            onInput('');
        } else {
            // User selected a predefined street.
            setManualMode(false);
            onInput(selectedValue);
        }
    };

    // The value displayed in the <select> dropdown.
    // If we're in manual mode, it should always show "Other...".
    // Otherwise, it reflects the actual value.
    const selectDisplayValue = isManualMode ? OTHER_VALUE : (value || '');

    return html`
        <div class="town-street-input-container">
            <div class="form-group">
                <label for=${id}>${label}</label>
                <select id=${id} value=${selectDisplayValue} onChange=${handleSelectChange}>
                    <option value="">${placeholder}</option>
                    ${availableStreets.map(name => html`<option key=${name} value=${name}>${name}</option>`)}
                    <option value=${OTHER_VALUE}>Other (manual entry)...</option>
                </select>
            </div>
            ${isManualMode && html`
                <div class="form-group">
                    <label for=${`${id}-manual`} class="sr-only">Manual entry for ${label}</label>
                    <input
                        id=${`${id}-manual`}
                        type="text"
                        value=${value || ''}
                        onInput=${(e) => onInput(e.currentTarget.value)}
                        placeholder="Enter custom street name"
                        autofocus
                    />
                </div>
            `}
        </div>
    `;
};


export const LocationEditor = ({ label, value, onInput, townCity, idPrefix, projectStreetNames, parentStreetName }) => {
    const [locationType, setLocationType] = useState('street'); // 'street', 'address', 'intersection'
    const [streetNumber, setStreetNumber] = useState('');
    const [street1, setStreet1] = useState('');
    const [street2, setStreet2] = useState('');
    const [isInternalUpdate, setIsInternalUpdate] = useState(false);

    // Parse the incoming value string to populate internal state
    useEffect(() => {
        if (isInternalUpdate) {
            setIsInternalUpdate(false);
            return;
        }
        const incomingValue = value || '';
        
        if (incomingValue.includes(' / ')) {
            const parts = incomingValue.split(' / ').map(s => s.trim());
            setLocationType('intersection');
            setStreet1(parts[0] || '');
            setStreet2(parts[1] || '');
            setStreetNumber('');
        } 
        else if (incomingValue.match(/^\d/)) {
            const match = incomingValue.match(/^([\d\w-]+)\s+(.*)/);
            if (match) {
                setLocationType('address');
                setStreetNumber(match[1]);
                setStreet1(match[2]);
                setStreet2('');
            } else {
                setLocationType('address');
                setStreetNumber(incomingValue);
                setStreet1('');
                setStreet2('');
            }
        }
        else {
            setLocationType('street');
            setStreet1(incomingValue);
            setStreetNumber('');
            setStreet2('');
        }
    }, [value]);

    // Compose the final string when internal state changes
    useEffect(() => {
        let composedValue = '';
        if (locationType === 'address') {
            composedValue = `${streetNumber} ${street1}`.trim();
        } else if (locationType === 'intersection') {
            composedValue = `${street1} / ${street2}`.trim();
            if (composedValue === '/') composedValue = '';
        } else { // 'street'
            composedValue = street1;
        }

        if (composedValue !== value) {
            setIsInternalUpdate(true);
            onInput(composedValue);
        }
    }, [locationType, streetNumber, street1, street2]);

    const handleTypeChange = (newType) => {
        setLocationType(newType);
        if (newType === 'intersection' && parentStreetName) {
            setStreet1(parentStreetName);
        }
    };

    return html`
        <div class="form-group form-grid-full">
            <label>${label}</label>
            <div class="location-editor">
                <div class="location-type-selector radio-group">
                    <label class="radio-label">
                        <input type="radio" name=${`${idPrefix}-type`} checked=${locationType === 'street'} onChange=${() => handleTypeChange('street')} />
                        <span>Street Only</span>
                    </label>
                     <label class="radio-label">
                        <input type="radio" name=${`${idPrefix}-type`} checked=${locationType === 'address'} onChange=${() => handleTypeChange('address')} />
                        <span>Address</span>
                    </label>
                     <label class="radio-label">
                        <input type="radio" name=${`${idPrefix}-type`} checked=${locationType === 'intersection'} onChange=${() => handleTypeChange('intersection')} />
                        <span>Intersection</span>
                    </label>
                </div>

                <div class="location-inputs">
                    ${locationType === 'street' && html`
                        <${TownStreetInput}
                            label="Street Name"
                            id=${`${idPrefix}-street1`}
                            value=${street1}
                            onInput=${setStreet1}
                            townCity=${townCity}
                            projectStreetNames=${projectStreetNames}
                        />
                    `}
                    ${locationType === 'address' && html`
                        <div class="form-grid">
                            <${InputField}
                                label="Street #"
                                id=${`${idPrefix}-street-number`}
                                value=${streetNumber}
                                onInput=${setStreetNumber}
                            />
                            <${TownStreetInput}
                                label="Street Name"
                                id=${`${idPrefix}-street1-addr`}
                                value=${street1}
                                onInput=${setStreet1}
                                townCity=${townCity}
                                projectStreetNames=${projectStreetNames}
                            />
                        </div>
                    `}
                    ${locationType === 'intersection' && html`
                        <div class="intersection-grid">
                           <${TownStreetInput}
                                label="Street 1"
                                id=${`${idPrefix}-street1-int`}
                                value=${street1}
                                onInput=${setStreet1}
                                townCity=${townCity}
                                projectStreetNames=${projectStreetNames}
                            />
                            <span>/</span>
                            <${TownStreetInput}
                                label="Street 2"
                                id=${`${idPrefix}-street2-int`}
                                value=${street2}
                                onInput=${setStreet2}
                                townCity=${townCity}
                                projectStreetNames=${projectStreetNames}
                            />
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
};
import React from 'react';
import InputMask from 'react-input-mask';
import { Form, FormControlProps } from 'react-bootstrap';

interface FormatCurrencyProps {
    currencyValue: number;
    localeCode: string;
}
    
const FormatCurrency: React.FC<FormatCurrencyProps> = ({ currencyValue, localeCode }) => {
    const valorFormatado = currencyValue.toLocaleString(localeCode, {
        style: 'currency',
        currency: 'BRL'
    });

    return <span>{valorFormatado}</span>;
};


interface FormatBrazilCurrencyProps {
    currencyValue?: number;
}
    
const FormatBrazilCurrency: React.FC<FormatBrazilCurrencyProps> = ({ currencyValue }) => {
    return <FormatCurrency currencyValue={currencyValue ?? 0} localeCode="pt-BR" />;
};

interface BrazilCurrencyInputProps extends Omit<FormControlProps, 'type' | 'value' | 'onChange'> {
    currency: number;
    onChange: (value: number) => void;
}

const MaskBrazilCurrencyInput: React.FC<BrazilCurrencyInputProps> = ({ currency, onChange, ...props }) => {

    let stringValue = currency.toString();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        stringValue = event.target.value;
        const rawValue = event.target.value.replace(/[^\d,-]/g, '');
        const numericValue = parseFloat(rawValue.replace(',', '.'));
        onChange(numericValue);
    };
    
    return (
        <InputMask
            name={`mask_${props.name}`}
            mask="R$ 999.999.999,99"
            placeholder="R$ 0,00"
            value={stringValue}
            onChange={handleChange}
        >
            {(_) => <Form.Control type='text' value={stringValue} {...props} onChange={handleChange} />}
        </InputMask>
    )
};

export { FormatBrazilCurrency, FormatCurrency, MaskBrazilCurrencyInput };

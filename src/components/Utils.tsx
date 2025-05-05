import React, { JSX } from 'react';
import { CurrencyInput } from 'react-currency-mask';
import { Form, FormControlProps } from 'react-bootstrap';
import { jsx } from 'react/jsx-runtime';

interface FormatBrazilCurrencyProps {
    currencyValue?: number;
}
    
const FormatBrazilCurrency: React.FC<FormatBrazilCurrencyProps> = ({ currencyValue }) => {
    const valorFormatado = (currencyValue ?? 0).toLocaleString("pt-BR", {
        style: 'currency',
        currency: 'BRL'
    });

    return <span>{valorFormatado}</span>;
};

interface BrazilCurrencyInputProps<T extends object> extends Omit<FormControlProps, 'type'> {
    value: number;
    entity: T;
    propName?: keyof T;
    setEntity: (entity: T) => void;
}

const MaskBrazilCurrencyInput = <T extends object>({
    value,
    entity,
    propName,
    setEntity,
    ...props
}: BrazilCurrencyInputProps<T>): JSX.Element => {
    return (
        <CurrencyInput value={value} onChangeValue={(_event, originalValue, _maskedValue) => {
            if (propName) {
                setEntity({ ...entity, [propName]: originalValue });
            }
            else if (props.name) {
                setEntity({ ...entity, [props.name]: originalValue });
            }
        }}
            InputElement={<Form.Control placeholder="R$ 0,00" type="text" value={value} {...props}  />}
        />
    )
};

interface FormatDateProps {
    value?: string | Date;
}
    
const FormatDate: React.FC<FormatDateProps> = ({ value }) => {
    if (typeof value === 'string') {
        value = new Date(value);
    }
    const valorFormatado = value?.toLocaleDateString("pt-BR") ?? "-";

    return <span>{valorFormatado}</span>;
};

export { FormatBrazilCurrency, MaskBrazilCurrencyInput, FormatDate };

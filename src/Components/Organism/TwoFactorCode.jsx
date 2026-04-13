import TextFieldGroup from "../Molecules/TextLabel";
import Button from "../Atoms/Button";

const TwoFactorCode = ({code, setCode, onSubmit}) => {
    return (
        <>
        <div>
            <TextFieldGroup
                label="Código de autenticación"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
            />
            <Button text="Verificar" onClick={onSubmit} />
        </div>
        </>
    );
};

export default TwoFactorCode;
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Vpc } from "../resources/Vpc";

interface NonDisposableStackProps extends StackProps {
    prefix: string
}

export class NonDisposableStack extends Stack{
    constructor(scope: Construct, id: string, props: NonDisposableStackProps){
        super(scope,id,props);

        const vpc = new Vpc(this, props.prefix);

    }
}

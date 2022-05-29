import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { BastionTest } from "../resources/BastionResources";
import { NonDisposableStack } from "./NonDisposableStack";

interface DisposableStackProps extends StackProps {
    prefix: string,
    nonDisposableStack: NonDisposableStack
}

export class DisposableStack extends Stack{
    constructor(scope: Construct, id: string, props: DisposableStackProps){
        super(scope,id,props);

        const ec2Resources = new BastionTest(this, 
            props.prefix,
            props.nonDisposableStack.vpcResources)
    }
}

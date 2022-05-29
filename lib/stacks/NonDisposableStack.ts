import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { VpcResources } from "../resources/VpcResources";

interface NonDisposableStackProps extends StackProps {
    prefix: string
}

export class NonDisposableStack extends Stack{
    public readonly vpcResources:VpcResources;

    constructor(scope: Construct, id: string, props: NonDisposableStackProps){
        super(scope,id,props);

        this.vpcResources = new VpcResources(this, props.prefix);

    }
}

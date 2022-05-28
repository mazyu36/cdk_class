import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

interface DisposableStackProps extends StackProps {
    prefix: string
}

export class DisposableStack extends Stack{
    constructor(scope: Construct, id: string, props: DisposableStackProps){
        super(scope,id,props);


    }
}

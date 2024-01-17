import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Skeleton,
} from "@nextui-org/react";

const LoadingCard = () => (
  <Card className="max-w-[600px]" radius="lg">
    <CardHeader className="flex flex-row items-center gap-2"> 
    <Skeleton className="h-16 w-16 rounded-xl">
      <div className="h-16 w-16 rounded-xl bg-default-300"></div>
    </Skeleton>
    <Skeleton className="rounded-xl">
      <div className="h-4 w-16 rounded-xl bg-default-300"></div>
    </Skeleton>

    </CardHeader>
    <Divider />
    <CardBody>
      <div className="space-y-3">
        <Skeleton className="w-1/5 rounded-lg mb-5">
          <div className="h-5 w-1/5 rounded-lg bg-default-50"></div>
        </Skeleton>

        <Skeleton className="w-4/5 rounded-lg ml-2">
          <div className="h-4 w-4/5 rounded-lg bg-default-200"></div>
        </Skeleton>
        <Skeleton className="w-2/5 rounded-lg ml-2">
          <div className="h-4 w-2/5 rounded-lg bg-default-300"></div>
        </Skeleton>
      </div>
    </CardBody>
    <Divider />
    <CardFooter />
  </Card>
);

export default LoadingCard;

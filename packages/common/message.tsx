const MessageComponent = ({ message }: { message: string }) => {
    return (
        <div className="ez-absolute ez-left-[45%] ez-top-[-28px] ez-rounded-md ez-bg-white ez-px-[5px] ez-py-[1px] ez-font-['JetBrainsMono'] ez-text-xs ez-font-normal ez-leading-snug ez-text-[#999999] ez-shadow-lg">
            {message}
        </div>
    );
};

export default MessageComponent;

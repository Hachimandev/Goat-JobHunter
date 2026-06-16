interface EmptyTableProps {
  type?: 'jobs' | 'companies' | 'applicants';
}

const EmptyTable = ({ type = 'jobs' }: EmptyTableProps) => {
  const getMessage = () => {
    switch (type) {
      case 'companies':
        return {
          title: 'Chưa theo dõi công ty nào',
          description: 'Hãy theo dõi các công ty để nhận thông báo việc làm mới',
        };
      default:
        return {
          title: 'Chưa có công việc đã lưu',
          description: 'Hãy lưu các công việc yêu thích để xem sau',
        };
    }
  };

  const message = getMessage();

  return (
    <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
      <p className="text-lg font-medium text-muted-foreground">{message.title}</p>
      <p className="text-sm text-muted-foreground mt-2">{message.description}</p>
    </div>
  );
};

export default EmptyTable;

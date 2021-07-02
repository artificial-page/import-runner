export default (str: string): string => {
  return str ? str.replace(/(^\n*|\n*$)/g, "") : ""
}
